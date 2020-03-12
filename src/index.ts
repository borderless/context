export interface Context<T> {
  value<K extends keyof T>(key: K): T[K];
}

/**
 * The `BackgroundContext` object implements the default `Context` interface.
 */
class BackgroundContext<T = {}> implements Context<T> {
  value<K extends keyof T>(key: K): T[K] {
    return undefined as any;
  }
}

/**
 * The `ValueContext` object implements a chain-able `Context` interface.
 */
class ValueContext<T> extends BackgroundContext<T> {
  constructor(
    private _parent: Context<any>,
    private _key: keyof T,
    private _value: T[typeof _key]
  ) {
    super();
  }

  value<K extends keyof T>(key: K): T[K] {
    if (key === this._key) return this._value as any;
    return this._parent.value(key);
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
  return new ValueContext<T & Record<K, V>>(parent, key, value as any);
}
