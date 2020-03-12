import { Emitter, once } from "@servie/events";

/**
 * Augment this interface to add type-safe `Context.signal#{on,off}`.
 */
export interface ContextEvents {
  abort: [];
}

/**
 * Augment this interface to add type-safe `Context#values`.
 */
export interface ContextValues {
  displayName: string;
}

/**
 * The `ContextSignal` provides an interface to notify of events anywhere in the application.
 */
export class ContextSignal extends Emitter<ContextEvents> {
  get aborted() {
    return false;
  }

  constructor() {
    super();

    // Listen for the abort signal.
    once(this, "abort", () => {
      Object.defineProperty(this, "aborted", { value: true });
    });
  }
}

/**
 * The `Context` object provides a hook for application events and values.
 */
export class Context {
  signal = new ContextSignal();
  values: Partial<ContextValues>;

  constructor(public parent?: Context) {
    // Proxy values and events from `parent`.
    if (parent) {
      parent.signal.each(({ type, args }) => this.signal.emit(type, ...args));
      this.values = Object.create(parent.values);
    } else {
      this.values = Object.create(null);
    }
  }

  abort() {
    this.signal.emit("abort");
  }

  get<T extends keyof ContextValues>(key: T): Partial<ContextValues>[T] {
    return this.values[key];
  }

  set<T extends keyof ContextValues>(key: T, value: ContextValues[T]) {
    this.values[key] = value;
  }
}
