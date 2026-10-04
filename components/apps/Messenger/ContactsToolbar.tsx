import { memo } from "react";
import Button from "styles/common/Button";

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

  return (
    <li className="toolbar">
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

export default memo(ContactsToolbar);
