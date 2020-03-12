# Context

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Bundle size][bundlephobia-image]][bundlephobia-url]

> Tiny, type-safe, JavaScript-native `context` implementation.

**Why?** Working on utilities across browsers, serverless and node.js require different of implementations, e.g. `fetch` vs `require('http')`. Go's [`context`](https://blog.golang.org/context) package provides a nice abstraction for my needs. By implementing a JavaScript first variation, we can achieve the same benefits.

## Installation

```sh
npm install @borderlesslabs/context --save
```

## Usage

Context events and values are unidirectional, child context automatically inherit the parents values.

```js
import { Context } from "@borderlesslabs/context";

const context = new Context();
const childContext = new Context(context);
```

### Values

The `context` provides a way to attach and retrieve values.

```js
context.set("test", true);

context.get("test"); //=> `true`
childContext.get("test"); //=> `true`

childContext.set("test", false);

context.get("test"); //=> `true`
childContext.get("test"); //=> `false`
```

### Events

The standard for async notifications in JavaScript is the event emitter. Based on the browser [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), the `context` has an [event emitter](https://github.com/serviejs/events) available on `signal`.

```js
context.signal.on("abort", () => {});
childContext.signal.on("abort", () => {});
context.abort(); // Triggers `abort` event.

context.signal.emit("test"); // Propagates to `childContext`.
childContext.signal.emit("test"); // Events are unidirectional, `context` is not triggered.
```

## Example

Tracing is a natural example for `context`:

```js
// Use a unique symbol for tracing.
const spanKey = Symbol('span');

// Start a new span, and automatically use "parent" span.
export function startSpan(ctx: Context, name: string) {
  const newCtx = new Context(ctx);
  const span = tracer.startSpan(name, {
    childOf: ctx.get(spanKey)
  });
  newCtx.set(spanKey, span);
  return [span, newCtx];
}

// server.js
async function app(req, next) {
  const [span, req.ctx] = startSpan(req.ctx, 'request');

  try {
    return await next();
  } finally {
    span.finish();
  }
}

// middleware.js
async function middleware(req, next) {
  const [span, req.ctx] = startSpan(req.ctx, 'middleware');

  try {
    return await next();
  } finally {
    span.finish();
  }
}
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/@borderlesslabs/context.svg?style=flat
[npm-url]: https://npmjs.org/package/@borderlesslabs/context
[downloads-image]: https://img.shields.io/npm/dm/@borderlesslabs/context.svg?style=flat
[downloads-url]: https://npmjs.org/package/@borderlesslabs/context
[travis-image]: https://img.shields.io/travis/BorderlessLabs/context.svg?style=flat
[travis-url]: https://travis-ci.org/BorderlessLabs/context
[coveralls-image]: https://img.shields.io/coveralls/BorderlessLabs/context.svg?style=flat
[coveralls-url]: https://coveralls.io/r/BorderlessLabs/context?branch=master
[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/@borderlesslabs/context.svg
[bundlephobia-url]: https://bundlephobia.com/result?p=@borderlesslabs/context
