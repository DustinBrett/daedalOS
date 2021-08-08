import { useSession } from "contexts/session";

type FocusedEntryProps = {
  className: string;
  onBlurCapture: React.FocusEventHandler;
  onClick: React.MouseEventHandler;
};

type FocusableEntry = (file: string) => FocusedEntryProps;

const useFocusableEntries = (
  fileManagerRef: React.MutableRefObject<HTMLOListElement | null>
): FocusableEntry => {
  const { focusedEntries, blurEntry, focusEntry } = useSession();
  const onBlurCapture: React.FocusEventHandler = ({ relatedTarget }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      !fileManagerRef.current?.contains(relatedTarget)
    ) {
      blurEntry();
    }
  };

  return (file: string) => {
    const focusedFile = focusedEntries.includes(file);
    const className = focusedFile ? "focus-within" : "";
    const onClick: React.MouseEventHandler = ({ ctrlKey }) => {
      if (ctrlKey) {
        if (focusedEntries.includes(file)) {
          blurEntry(file);
        } else {
          focusEntry(file);
        }
      } else {
        blurEntry();
        focusEntry(file);
      }
    };

    return { className, onBlurCapture, onClick };
  };
};

export default useFocusableEntries;
