import type { DependencyList } from "react";
import { useCallback, useEffect, useState } from "react";

export const useAsync = <T>(
  asyncFn: () => Promise<T>,
  dependencies: DependencyList
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): [T | undefined, any | undefined] => {
  const memoizedAsync = useCallback(asyncFn, [asyncFn, ...dependencies]);
  const [value, setValue] = useState<T>();
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
  const [error, setError] = useState<any>();

  useEffect(() => {
    memoizedAsync()
      .then((newValue) => {
        setValue(newValue);
        /* eslint-disable-next-line unicorn/no-useless-undefined */
        setError(undefined);
      })
      .catch((newError) => {
        /* eslint-disable-next-line unicorn/no-useless-undefined */
        setValue(undefined);
        setError(newError);
      });
  }, [memoizedAsync]);

  return [value, error];
};
