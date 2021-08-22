import { useSession } from "contexts/session";

type FocusChecker = (file: string) => boolean;

const useFocusChecker = (
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>
): FocusChecker => {
  const { focusedEntries } = useSession();

  return (file: string) =>
    focusedEntries.includes(file) &&
    Boolean(fileManagerRef.current?.contains(document.activeElement));
};

export default useFocusChecker;
