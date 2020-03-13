import * as context from "./index";
import { performance } from "perf_hooks";

const testKey = Symbol("test");

describe("assign", () => {
  const ctx = context.background;

  describe("withValue", () => {
    it("should hold values", () => {
      const newCtx = context.withValue(ctx, "test", true);
      const anotherCtx = context.withValue(newCtx, testKey, 123);

      expect(newCtx.value("test")).toEqual(true);
      expect(anotherCtx.value("test")).toEqual(true);
      expect(anotherCtx.value(testKey)).toEqual(123);
    });

    it("should allow optional keys", () => {
      const test = (ctx: context.Context<{ prop?: boolean }>) => {
        return ctx.value("prop");
      };

      expect(test(ctx)).toEqual(undefined);
      expect(test(context.withValue(ctx, "prop", true))).toEqual(true);
    });
  });

  describe("withAbort", () => {
    it("should allow abort", async () => {
      const fn = jest.fn();
      const reason = new Error();
      const [newCtx, abort] = context.withAbort(ctx);

      context.useAbort(ctx).catch(fn);
      context.useAbort(newCtx).catch(fn);

      expect(fn).toHaveBeenCalledTimes(0);

      abort(reason);

      await expect(context.useAbort(newCtx)).rejects.toBe(reason);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should inherit abort", async () => {
      const reason = new Error();
      const [newCtx, abort] = context.withAbort(ctx);
      const [anotherCtx] = context.withAbort(newCtx);

      abort(reason);

      await expect(context.useAbort(newCtx)).rejects.toBe(reason);
      await expect(context.useAbort(anotherCtx)).rejects.toBe(reason);
    });
  });

  describe("withTimeout", () => {
    it("should abort on a timeout", async () => {
      const start = performance.now();
      const [newCtx] = context.withTimeout(ctx, 100);

      await expect(context.useAbort(newCtx)).rejects.toBeInstanceOf(Error);

      const end = performance.now();

      expect(end - start).toBeGreaterThan(100);
    });

    it("should allow manual abort", async () => {
      const reason = new Error();
      const [newCtx, abort] = context.withTimeout(ctx, 100);

      abort(reason);

      await expect(context.useAbort(newCtx)).rejects.toBe(reason);
    });
  });
});
