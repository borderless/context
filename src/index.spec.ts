import { Context } from "./index";

const testKey = Symbol("test");

declare module "./index" {
  interface ContextValues {
    test: boolean;
    [testKey]: number;
  }

  interface ContextEvents {
    test: [boolean];
    [testKey]: [number];
  }
}

describe("assign", () => {
  let ctx: Context;

  beforeEach(() => {
    ctx = new Context();
  });

  it("should hold values", () => {
    ctx.set("test", true);

    expect(ctx.get("test")).toEqual(true);
  });

  it("should hold values for symbols", () => {
    ctx.set(testKey, 123);

    expect(ctx.get(testKey)).toEqual(123);
  });

  it("should trigger events", () => {
    const fn = jest.fn();

    ctx.signal.on("test", fn);
    ctx.signal.emit("test", true);

    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(true);
  });

  it("should trigger events for symbols", () => {
    const fn = jest.fn();

    ctx.signal.on(testKey, fn);
    ctx.signal.emit(testKey, 123);

    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(123);
  });

  it("should trigger abort", () => {
    const fn = jest.fn();

    ctx.signal.on("abort", fn);

    expect(ctx.signal.aborted).toEqual(false);
    expect(fn).toBeCalledTimes(0);

    ctx.abort();

    expect(ctx.signal.aborted).toEqual(true);
    expect(fn).toBeCalledTimes(1);
  });

  describe("with child context", () => {
    let child: Context;

    beforeEach(() => {
      child = new Context(ctx);
    });

    it("should propagate values", () => {
      ctx.set("test", true);

      expect(child.get("test")).toEqual(true);
    });

    it("should propagate values with symbols", () => {
      ctx.set(testKey, 123);

      expect(child.get(testKey)).toEqual(123);
    });

    it("should not set values on parent", () => {
      child.set("test", true);

      expect(child.get("test")).toEqual(true);
      expect(ctx.get("test")).toEqual(undefined);
    });

    it("should not set values on parent with symbols", () => {
      child.set(testKey, 1);

      expect(child.get(testKey)).toEqual(1);
      expect(ctx.get(testKey)).toEqual(undefined);
    });

    it("should shadow parent values", () => {
      ctx.set("test", true);
      child.set("test", false);

      expect(ctx.get("test")).toEqual(true);
      expect(child.get("test")).toEqual(false);
    });

    it("should shadow parent values with symbols", () => {
      ctx.set(testKey, 1);
      child.set(testKey, 2);

      expect(ctx.get(testKey)).toEqual(1);
      expect(child.get(testKey)).toEqual(2);
    });

    it("should propagate events", () => {
      const fn = jest.fn();

      child.signal.on("test", fn);
      ctx.signal.emit("test", true);

      expect(fn).toBeCalledTimes(1);
      expect(fn).toBeCalledWith(true);
    });

    it("should propagate events with symbols", () => {
      const fn = jest.fn();

      child.signal.on(testKey, fn);
      ctx.signal.emit(testKey, 123);

      expect(fn).toBeCalledTimes(1);
      expect(fn).toBeCalledWith(123);
    });
  });
});
