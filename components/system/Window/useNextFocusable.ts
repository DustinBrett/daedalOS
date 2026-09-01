import { useNextFocusableId } from "contexts/process";
import { useStackOrder } from "contexts/session";

const useNextFocusable = (id: string): string =>
  useNextFocusableId(id, useStackOrder());

export default useNextFocusable;
