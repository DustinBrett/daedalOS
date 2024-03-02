import { useMemo } from "react";

export const useFinePointer = (): boolean =>
  useMemo(() => window.matchMedia("(pointer: fine)").matches, []);
