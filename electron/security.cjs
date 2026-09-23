const path = require('node:path');
function serverUrl(value) {
  const url = new URL(value);
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
    url.search ||
    url.hash
  )
    throw new Error('The server must use HTTPS, or HTTP on localhost for development.');
  if (url.pathname.replace(/\/$/, '') !== '/api/v1')
    throw new Error('The server URL must end in /api/v1.');
  return url.href.replace(/\/$/, '');
}
function externalUrl(value) {
  const url = new URL(value);
  if (url.username || url.password || !['https:', 'http:'].includes(url.protocol))
    throw new Error('Unsupported external link.');
  if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    throw new Error('External links must use HTTPS.');
  return url.href;
}
function assetPath(root, pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded.includes('\0') || decoded.includes('\\')) throw new Error('Invalid asset path.');
  const target = path.resolve(root, '.' + decoded);
  if (!target.startsWith(path.resolve(root) + path.sep)) throw new Error('Invalid asset path.');
  return target;
}
module.exports = { serverUrl, externalUrl, assetPath };
