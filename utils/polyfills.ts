// Next transpiles syntax for the browserslist floor but doesn't polyfill APIs,
// so newer ones that the app or its dependencies call are added when missing
const define = (target: object, name: string, value: unknown): void => {
  if (!(name in target)) {
    Object.defineProperty(target, name, {
      configurable: true,
      value,
      writable: true,
    });
  }
};

define(
  String.prototype,
  "replaceAll",
  function replaceAll(
    this: string,
    search: RegExp | string,
    replacement: string
  ): string {
    return this.replace(
      typeof search === "string"
        ? new RegExp(
            search.replace(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`),
            "g"
          )
        : search,
      replacement
    );
  }
);

define(String.prototype, "at", function at(this: string, index: number) {
  const position = Math.trunc(index) || 0;

  return (
    this.charAt(position < 0 ? this.length + position : position) || undefined
  );
});

define(Array.prototype, "findLastIndex", function findLastIndex<
  T,
>(this: T[], predicate: (value: T, index: number, array: T[]) => unknown): number {
  for (let index = this.length - 1; index >= 0; index -= 1) {
    if (predicate(this[index], index, this)) return index;
  }

  return -1;
});

define(
  Promise,
  "any",
  <T>(values: Iterable<PromiseLike<T> | T>): Promise<T> =>
    new Promise((resolve, reject) => {
      const promises = [...values];
      const errors: unknown[] = [];
      let pending = promises.length;
      const rejectAll = (): void =>
        reject(
          Object.assign(new Error("All promises were rejected"), { errors })
        );

      if (pending === 0) rejectAll();

      promises.forEach((value, index) =>
        Promise.resolve(value).then(resolve, (error: unknown) => {
          errors[index] = error;
          pending -= 1;

          if (pending === 0) rejectAll();
        })
      );
    })
);
