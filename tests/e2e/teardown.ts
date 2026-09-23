export default async function teardown() {
  try {
    await fetch('http://127.0.0.1:4100/__frontend_test_stop', {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* The managed server may already be stopped. */
  }
}
