export interface Context<T> {
  value<K extends keyof T>(key: K): T[K];
}

/**
 * The `BackgroundContext` object implements the default `Context` interface.
 */
class BackgroundContext implements Context<{}> {
  value(): never {
    return undefined as never;
  }
}

/**
 * The `ValueContext` object implements a chain-able `Context` interface.
 */
class ValueContext<P, T> implements Context<T> {
  constructor(
    private p: Context<P>,
    private k: keyof T,
    private v: T[typeof k]
  ) {}

  value<K extends keyof (T & P)>(key: K): (T & P)[K] {
    if (key === this.k) return this.v as (T & P)[K];
    return this.p.value(key as keyof P) as (T & P)[K];
  }
}

/**
 * Initial context.
 */
export const background: Context<{}> = new BackgroundContext();

/**
 * Create a `context` object that inherits from the parent values.
 */
export function withValue<T, K extends PropertyKey, V extends any>(
  parent: Context<T>,
  key: K,
  value: V
): Context<T & Record<K, V>> {
  return new ValueContext<T, Record<K, V>>(parent, key, value);
}

/**
 * Abort function type.
 */
export type AbortFn = (reason: Error) => void;

/**
 * Abort symbol for context.
 */
const abortKey = Symbol("abort");

/**
 * Values used to manage `abort` in the context.
 */
export type AbortContextValue = Record<typeof abortKey, Promise<never>>;

/**
 * Create a cancellable `context` object.
 */
export function withAbort<T>(
  parent: Context<T & Partial<AbortContextValue>>
): [Context<T & AbortContextValue>, AbortFn] {
  let abort: AbortFn;
  let prev: Promise<never> | undefined;
  const promise = new Promise<never>((_, reject) => (abort = reject));
  (prev = parent.value(abortKey)) && prev.catch(abort!); // Propagate aborts.
  return [withValue(parent, abortKey, promise), abort!];
}

/**
 * Create a `context` which aborts after _ms_.
 */
export function withTimeout<T>(
  parent: Context<T>,
  ms: number
): [Context<T & AbortContextValue>, AbortFn] {
  const [ctx, cancel] = withAbort(parent);
  const timeout = setTimeout(cancel, ms, new Error("Context timed out"));
  const abort = (reason: Error) => (clearTimeout(timeout), cancel(reason));
  return [ctx, abort];
}

/**
 * Use the abort signal.
 */
export function useAbort(ctx: Context<Partial<AbortContextValue>>) {
  return ctx.value(abortKey) || new Promise<never>(() => 0);
}
