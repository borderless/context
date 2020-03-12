import * as context from "./index";

const testKey = Symbol("test");

describe("assign", () => {
  const ctx = context.background;

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
