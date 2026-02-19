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

More complete example handling connection lifecycle and multiple actions:

```ts
import { createClient, Actions } from 'ami-bridge';

const amibridge = createClient({
  host: '127.0.0.1',
  port: 5038,
  login: 'admin',
  password: 'admin',
});

amibridge.on('incorrectServer', () => {
  amibridge.logger.error('Invalid AMI welcome message. Are you sure if this is AMI?');
  process.exit(1);
});

amibridge.on('connectionRefused', () => {
  amibridge.logger.error('Connection refused.');
  process.exit(1);
});

amibridge.on('incorrectLogin', () => {
  amibridge.logger.error('Incorrect login or password.');
  process.exit(1);
});

amibridge.on('event', (event) => {
  amibridge.logger.info('event:', event);
});

amibridge.on('connected', () => {
  setTimeout(() => {
    amibridge.on('disconnected', () => {
      process.exit(0);
    });

    amibridge.send(new Actions.QueueStatus(), (errQueue, resQueue) => {
      if (errQueue) {
        amibridge.logger.error('QueueStatus error:', errQueue);
      } else {
        amibridge.logger.info('QueueStatus response:', resQueue);
      }

      amibridge.send(new Actions.SipPeers(), (errPeers, resPeers) => {
        if (errPeers) {
          amibridge.logger.error('SipPeers error:', errPeers);
        } else {
          amibridge.logger.info('SipPeers response:', resPeers);
        }

        amibridge.send(new Actions.Ping(), (errPing, resPing) => {
          if (errPing) {
            amibridge.logger.error('Ping error:', errPing);
          } else {
            amibridge.logger.info('Ping response:', resPing);
          }
          amibridge.disconnect();
        });
      });
    });
  }, 10000);
});

amibridge.connect();
```

Public API from the `ami-bridge` package (entrypoint `dist/index.js`): `Client`, `createClient`, `Actions`, `Action`, `Event`, `Response`, `Logger`, `SilentLogger`.

## Usage (CJS)

```js
const { createClient, Actions } = require('ami-bridge');

const client = createClient({
  host: '127.0.0.1',
  port: 5038,
  login: 'admin',
  password: 'admin',
});

client.connect();

client.send(new Actions.Ping(), (err, data) => {
  if (err) {
    console.error('PING error:', err);
  } else {
    console.log('PING response:', data);
  }
});
```

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
