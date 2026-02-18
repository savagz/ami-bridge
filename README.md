# ami-bridge

Asterisk Manager Interface (AMI) client for Node.js, modernized to ESM + TypeScript.

## Features

- AMI client for Node.js (ESM + TypeScript, Node >= 18).
- High-level API for common AMI actions (Ping, CoreStatus, QueueStatus, SIPPeers, etc.).
- Built-in CLI (`ami-bridge`) for quick inspection and event dumps.
- Test suite with Vitest and V8-based coverage (ready for Codecov).

## Installation

```bash
npm install ami-bridge
```

Requires Node.js >= 18.

## Usage (ESM)

```ts
import { createClient, Actions } from 'ami-bridge';

const client = createClient({
  host: '127.0.0.1',
  port: 5038,
  login: 'admin',
  password: 'admin',
});

client.connect();

client.send(new (Actions as any).Ping(), (err, data) => {
  if (err) {
    console.error('PING error:', err);
  } else {
    console.log('PING response:', data);
  }
});
```

Public API from the `ami-bridge` package (entrypoint `dist/index.js`): `Client`, `createClient`, `Actions`, `Action`, `Event`, `Response`, `Logger`, `SilentLogger`.

## CLI

A CLI bin `ami-bridge` is included:

```bash
npx ami-bridge <user> <password> [host[:port]] [-h host] [-p port] [-f eventsFile]
```

Example:

```bash
npx ami-bridge admin admin 127.0.0.1:5038
```

Options:
- `-h`: AMI host (default `127.0.0.1`)
- `-p`: AMI port (default `5038`)
- `-f`: saves received events to a JSON file

## Development

```bash
npm run build
npm run lint
npm test
```

Generate lcov coverage:

```bash
npm run coverage:lcov
```

## License

MIT
