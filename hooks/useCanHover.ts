import { useMemo } from "react";

export const useCanHover = (): boolean =>
  useMemo(() => window.matchMedia("(hover: hover)").matches, []);
