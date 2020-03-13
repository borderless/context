# Context

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Bundle size][bundlephobia-image]][bundlephobia-url]

> Tiny, type-safe, JavaScript-native `context` implementation.

**Why?** Working on a project across browsers, workers and node.js requires different implementations on the same thing, e.g. `fetch` vs `require('http')`. Go's [`context`](https://blog.golang.org/context) package provides a nice abstraction to bring all the interfaces together. By implementing a JavaScript first variation, we can achieve the same benefits.

## Installation

```sh
npm install @borderless/context --save
```

## Usage

Context values are unidirectional.

```ts
import { background, withValue } from "@borderless/context";

// Extend the default `background` context with a value.
const ctx = withValue(background, "test", "test");

ctx.value("test"); //=> "test"
background.value("test"); // Invalid.
```

### Abort

Use `withAbort` to support cancellation of execution in your application.

```ts
import { withAbort } from "@borderless/context";

const [ctx, abort] = withAbort(parentCtx);

onUserCancelsTask(() => abort(new Error("User canceled task")));
```

### Timeout

Use `withTimeout` when you want to abort after a specific duration:

```ts
import { withTimeout } from "@borderless/context";

const [ctx, abort] = withTimeout(parentCtx, 5000); // You can still `abort` manually.
```

### Using Abort

The `useAbort` method will return a `Promise` which rejects when aborted.

```ts
import { useAbort } from "@borderless/context";

// Race between the abort signal and making an ajax request.
Promise.race([useAbort(ctx), ajax("http://example.com")]);
```

## Example

### Abort Controller

Use `context` with other abort signals, such as `fetch`.

```ts
import { useAbort, Context } from "@borderless/context";

function request(ctx: Context<{}>, url: string) {
  const controller = new AbortController();
  withAbort(ctx).catch(e => controller.abort());
  return fetch(url, { signal: controller.signal });
}
```

### Application Tracing

Distributed application tracing is a natural example for `context`:

```ts
import { Context, withValue } from "@borderless/context";

// Use a unique symbol for tracing.
const spanKey = Symbol("span");

// Start a new span, and automatically use "parent" span.
export function startSpan<T extends { [spanKey]?: Span }>(
  ctx: Context<T>,
  name: string
): [Span, Context<T & { [spanKey]: Span }>] {
  const span = tracer.startSpan(name, {
    childOf: ctx.value(spanKey)
  });

  return [span, withValue(ctx, spanKey, span)];
}

// server.js
export async function app(req, next) {
  const [span, ctx] = startSpan(req.ctx, "app");

  req.ctx = ctx;

  try {
    return await next();
  } finally {
    span.finish();
  }
}

// middleware.js
export async function middleware(req, next) {
  const [span, ctx] = startSpan(req.ctx, "middleware");

  req.ctx = ctx;

  try {
    return await next();
  } finally {
    span.finish();
  }
}
```

### Libraries

JavaScript and TypeScript libraries can accept a typed `context` argument.

```ts
import { Context, withValue } from "@borderless/context";

export function withSentry<T>(ctx: Context<T>) {
  return withValue(ctx, sentryKey, someSentryImplementation);
}

export function captureException(
  ctx: Context<{ [sentryKey]: SomeSentryImplementation }>,
  error: Error
) {
  return ctx.value(sentryKey).captureException(error);
}
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/@borderless/context.svg?style=flat
[npm-url]: https://npmjs.org/package/@borderless/context
[downloads-image]: https://img.shields.io/npm/dm/@borderless/context.svg?style=flat
[downloads-url]: https://npmjs.org/package/@borderless/context
[travis-image]: https://img.shields.io/travis/BorderlessLabs/context.svg?style=flat
[travis-url]: https://travis-ci.org/BorderlessLabs/context
[coveralls-image]: https://img.shields.io/coveralls/BorderlessLabs/context.svg?style=flat
[coveralls-url]: https://coveralls.io/r/BorderlessLabs/context?branch=master
[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/@borderless/context.svg
[bundlephobia-url]: https://bundlephobia.com/result?p=@borderless/context
