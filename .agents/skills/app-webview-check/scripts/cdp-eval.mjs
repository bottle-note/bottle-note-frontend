// Evaluate a JS expression in the Android app WebView over CDP.
// usage: node cdp-eval.mjs <port> <expression | path/to/file.js>
import { existsSync, readFileSync } from 'node:fs';

const [port = '9222', arg] = process.argv.slice(2);
if (!arg) {
  console.error('usage: node cdp-eval.mjs <port> <expression | file.js>');
  process.exit(1);
}
const expression = existsSync(arg) ? readFileSync(arg, 'utf8') : arg;

const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find((t) => t.type === 'page');
if (!page) {
  console.error('no page target: is the app open and the port forwarded?');
  process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
ws.onopen = () =>
  ws.send(
    JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression, returnByValue: true, awaitPromise: true },
    }),
  );
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.id !== 1) return;
  console.log(page.url);
  const { result, exceptionDetails } = data.result;
  console.log(
    JSON.stringify(exceptionDetails ?? result.value ?? result, null, 1),
  );
  ws.close();
};
