// Isolated integration environment. This script never targets the working PMS database.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
try {
  const live = await fetch('http://127.0.0.1:4100/health/live', {
    signal: AbortSignal.timeout(1000),
  });
  if (live.ok) throw new Error('FRONTEND_TEST_SERVER_RUNNING');
} catch (error) {
  if (error.message === 'FRONTEND_TEST_SERVER_RUNNING') throw error;
}
const backend = fileURLToPath(new URL('../../BE/', import.meta.url));
const requireBE = createRequire(new URL('../../BE/package.json', import.meta.url));
requireBE('dotenv').config({ path: backend + '.env', quiet: true });
const { Client } = requireBE('pg');
const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.pathname = '/pms_frontend_test';
process.env.DATABASE_URL = dbUrl.href;
process.env.NODE_ENV = 'test';
process.env.PORT = '4100';
process.env.PUBLIC_WEB_URL = 'http://localhost:3100';
process.env.TRUSTED_ORIGINS =
  'http://localhost:3100,http://127.0.0.1:3100,capacitor://localhost,https://localhost';
process.env.COOKIE_SECURE = 'false';
const redisUrl = new URL(process.env.REDIS_URL);
redisUrl.pathname = '/5';
process.env.REDIS_URL = redisUrl.href;
process.env.S3_BUCKET = 'pms-frontend-test';
// Prevent test notifications from reaching external providers.
delete process.env.PUSH_WEBHOOK_URL;
delete process.env.SMS_WEBHOOK_URL;
delete process.env.PROVIDER_TOKEN;
const adminUrl = new URL(dbUrl);
adminUrl.pathname = '/postgres';
const admin = new Client({ connectionString: adminUrl.href });
await admin.connect();
if (
  !(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', ['pms_frontend_test'])).rowCount
)
  await admin.query('CREATE DATABASE "pms_frontend_test"');
await admin.end();
execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], {
  cwd: backend,
  env: process.env,
  stdio: 'pipe',
  timeout: 60000,
});
const client = new Client({ connectionString: dbUrl.href });
await client.connect();
if ((await client.query('SELECT current_database() AS name')).rows[0].name !== 'pms_frontend_test')
  throw new Error('Refusing to reset a non-test database.');
const tables = await client.query(
  "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations'",
);
if (tables.rows.length)
  await client.query(
    'TRUNCATE ' +
      tables.rows.map((t) => '"' + t.tablename.replaceAll('"', '""') + '"').join(',') +
      ' CASCADE',
  );
await client.end();
const { createApp } = await import('../../BE/dist/src/app.js');
const { db } = await import('../../BE/dist/src/database/client.js');
const { redis } = await import('../../BE/dist/src/integrations/redis.js');
await redis.flushdb(); // Dedicated Redis database 5, selected above.
const { ensureStorage } = await import('../../BE/dist/src/integrations/storage.js');
await ensureStorage();
const { permissions } = await import('../../BE/dist/src/common/permissions.js');
const { passwordHash } = await import('../../BE/dist/src/modules/auth/service.js');
const password = 'Frontend-Test-Only-94!';
await db.permission.createMany({ data: permissions.map((key) => ({ key })) });
const role = await db.role.create({
  data: {
    name: 'UI Test Administrator',
    permissions: { create: permissions.map((permissionKey) => ({ permissionKey })) },
  },
});
const readRole = await db.role.create({
  data: {
    name: 'UI Test Reader',
    permissions: {
      create: ['projects.read', 'inventory.read'].map((permissionKey) => ({ permissionKey })),
    },
  },
});
const hash = await passwordHash(password);
const users = [];
for (const [email, name, roleId] of [
  ['manager@frontend.test', 'Alex Morgan', role.id],
  ['approver@frontend.test', 'Sam Rivers', role.id],
  ['reader@frontend.test', 'Taylor Reader', readRole.id],
])
  users.push(
    await db.user.create({
      data: { email, name, passwordHash: hash, roles: { create: { roleId } } },
    }),
  );
const app = createApp();
let ready = false;
const { createServer } = requireBE('node:http');
const server = createServer((req, res) => {
  if (req.url === '/__frontend_test_ready') {
    res.writeHead(ready ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ready }));
  } else if (req.url === '/__frontend_test_stop' && req.method === 'POST') {
    res.end('stopping');
    void stop();
  } else app(req, res);
}).listen(4100, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const base = 'http://127.0.0.1:4100/api/v1';
async function request(path, body, token) {
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const envelope = await response.json();
  if (!response.ok) throw new Error(path + ': ' + JSON.stringify(envelope.error));
  return envelope.data;
}
const tokens = [];
for (const user of users)
  tokens.push(
    (await request('/auth/native/login', { email: user.email, password, platform: 'electron' }))
      .accessToken,
  );
const project = await request(
  '/projects',
  { name: 'Parkside Residences', code: 'PARK', currency: 'PKR', timezone: 'Asia/Karachi' },
  tokens[0],
);
const second = await request(
  '/projects',
  { name: 'Harbour Quarter', code: 'HBR', currency: 'USD', timezone: 'America/New_York' },
  tokens[0],
);
await db.userProjectAccess.createMany({
  data: users.slice(1).map((user) => ({ userId: user.id, projectId: project.id })),
});
const root = '/projects/' + project.id;
const customers = [];
for (const name of ['Ayesha Khan', 'Daniel Reed', 'Omar Siddiqui'])
  customers.push(
    await request(
      root + '/customers',
      {
        name,
        phone: '+923001234567',
        identity: 'UI-' + crypto.randomUUID(),
        email: name.split(' ')[0].toLowerCase() + '@example.test',
      },
      tokens[0],
    ),
  );
const units = [];
for (let i = 1; i <= 32; i++)
  units.push({
    number: 'A-' + String(i).padStart(3, '0'),
    phase: 'Phase 1',
    block: i <= 16 ? 'A' : 'B',
    type: i % 3 === 0 ? 'APARTMENT' : 'RESIDENTIAL_PLOT',
    size: '5',
    measurementUnit: 'marla',
    price: String(3500000 + i * 25000) + '.00',
    charges: '50000.00',
  });
await request(root + '/units/import', { units }, tokens[0]);
const inventory = await request(root + '/units?limit=100', undefined, tokens[0]);
const plan = await request(
  root + '/payment-plans',
  {
    name: 'Flexible 24 months',
    schedule: [
      { label: 'Down payment', percent: '20', days: 0 },
      { label: 'First installment', percent: '40', months: 12 },
      { label: 'Final installment', percent: '40', months: 24 },
    ],
  },
  tokens[0],
);
for (const name of ['Sara Ahmed', 'Marcus Chen', 'Noor Hassan'])
  await request(
    root + '/leads',
    { name, phone: '+923001234568', source: 'Website', assignedTo: users[0].id },
    tokens[0],
  );
const accounts = await request(root + '/accounts', undefined, tokens[0]);
const fixture = {
  projectId: project.id,
  secondProjectId: second.id,
  customerId: customers[0].id,
  unitId: inventory.items[0].id,
  planVersionId: plan.versions[0].id,
  cashId: accounts.find((a) => a.code === '1000').id,
  users: users.map((u) => ({ id: u.id, email: u.email })),
  password,
};
const target = new URL('../test-results/', import.meta.url);
await mkdir(target, { recursive: true });
await writeFile(new URL('fixture.json', target), JSON.stringify(fixture));
const worker = spawn(process.execPath, ['dist/src/jobs/worker.js'], {
  cwd: backend,
  env: process.env,
  stdio: 'ignore',
  windowsHide: true,
});
ready = true;
console.log('Frontend integration API ready on 4100 (isolated PostgreSQL and Redis databases).');
async function stop() {
  setTimeout(() => process.exit(0), 1500).unref();
  worker.kill();
  server.closeAllConnections();
  server.close();
  await db.$disconnect();
  await redis.quit();
  process.exit(0);
}
process.on('SIGTERM', () => void stop());
process.on('SIGINT', () => void stop());
