import { useSession } from "contexts/session";

type FocusedEntryProps = {
  className: string;
  onBlurCapture: React.FocusEventHandler;
  onClick: React.MouseEventHandler;
};

type FocusableEntry = (file: string) => FocusedEntryProps;

const useFocusableEntries = (
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>
): { focusableEntry: FocusableEntry } => {
  const { focusedEntries, blurEntry, focusEntry } = useSession();
  const focusableEntry = (file: string) => {
    const focusedFile = focusedEntries.includes(file);
    const className = focusedFile ? "focus-within" : "";
    const onBlurCapture: React.FocusEventHandler = ({ relatedTarget }) => {
      if (
        !(relatedTarget instanceof HTMLElement) ||
        !fileManagerRef.current?.contains(relatedTarget)
      ) {
        focusedEntries.forEach((focusedEntry) => blurEntry(focusedEntry));
      }
    };
    const onClick: React.MouseEventHandler = ({ ctrlKey }) => {
      if (ctrlKey) {
        if (focusedEntries.includes(file)) {
          blurEntry(file);
        } else {
          focusEntry(file);
        }
      } else {
        focusedEntries.forEach((focusedEntry) => blurEntry(focusedEntry));
        focusEntry(file);
      }
    };

    return { className, onBlurCapture, onClick };
  };

  return { focusableEntry };
};

export default useFocusableEntries;
