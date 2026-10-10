import { useEffect, useRef } from "react";
import Button from "styles/common/Button";
import { PREVENT_SCROLL } from "utils/constants";
import { whenFocusLost } from "utils/keyboard";

type ContactsToolbarProps = {
  actions: [string, (keys: string[]) => void][];
  keys: string[];
  selectedKeys?: string[];
  setSelectedKeys: (keys?: string[]) => void;
  title: string;
};

const ContactsToolbar: FC<ContactsToolbarProps> = ({
  actions,
  keys,
  selectedKeys,
  setSelectedKeys,
  title,
}) => {
  const allSelected =
    keys.length > 0 && keys.every((key) => selectedKeys?.includes(key));
  const toolbarRef = useRef<HTMLLIElement>(null);
  const isSelecting = Boolean(selectedKeys);

  useEffect(() => {
    // Switching modes or views removes the focused button, so focus follows
    whenFocusLost(() =>
      toolbarRef.current
        ?.querySelector<HTMLElement>("input, button")
        ?.focus(PREVENT_SCROLL)
    );
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [isSelecting, title]);

  return (
    <li ref={toolbarRef} className="toolbar">
      {selectedKeys ? (
        <>
          <label>
            <input
              checked={allSelected}
              onChange={() => setSelectedKeys(allSelected ? [] : keys)}
              type="checkbox"
            />
            {`${selectedKeys.length} selected`}
          </label>
          {actions.map(([label, action]) => (
            <Button
              key={label}
              disabled={selectedKeys.length === 0}
              onClick={() => {
                action(selectedKeys);
                setSelectedKeys();
              }}
            >
              {label}
            </Button>
          ))}
          <Button onClick={() => setSelectedKeys()}>Done</Button>
        </>
      ) : (
        <>
          <h2>{title}</h2>
          {keys.length > 0 && (
            <Button onClick={() => setSelectedKeys([])}>Select</Button>
          )}
        </>
      )}
    </li>
  );
};

export default ContactsToolbar;
