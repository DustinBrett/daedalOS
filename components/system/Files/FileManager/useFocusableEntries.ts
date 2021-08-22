import useFocusChecker from "components/system/Files/FileEntry/useFocusChecker";
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
  const { blurEntry, focusEntry } = useSession();
  const onBlurCapture: React.FocusEventHandler = ({ relatedTarget }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      !fileManagerRef.current?.contains(relatedTarget)
    ) {
      blurEntry();
    }
  };
  const isFocused = useFocusChecker(fileManagerRef);

  return (file: string) => {
    const className = isFocused(file) ? "focus-within" : "";
    const onClick: React.MouseEventHandler = ({ ctrlKey }) => {
      if (ctrlKey) {
        if (isFocused(file)) {
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
