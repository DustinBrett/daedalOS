import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  BLOCKED_KEYS_IDB_NAME,
  DELETED_CHATS_IDB_NAME,
  SEEN_EVENT_IDS_PATH,
} from "components/apps/Messenger/constants";
import { type NostrProfile } from "components/apps/Messenger/types";
import { useFileSystemActions } from "contexts/fileSystem";

type Profiles = Record<string, NostrProfile>;

export type TimeScale = "infinite" | "month" | "trimester" | "week";

type History = {
  blockedKeys: string[];
  deletedChats: Record<string, number>;
  profiles: Profiles;
  seenEventIds: string[];
  setBlockedKeys: React.Dispatch<React.SetStateAction<string[]>>;
  setDeletedChats: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setProfiles: React.Dispatch<React.SetStateAction<Profiles>>;
  setSeenEventIds: React.Dispatch<React.SetStateAction<string[]>>;
  setTimeScale: React.Dispatch<React.SetStateAction<TimeScale>>;
  timeScale: TimeScale;
};

const HistoryContext = createContext({} as History);

export const useHistoryContext = (): History => useContext(HistoryContext);

const readStoredState = <T extends object>(key: string, emptyValue: T): T => {
  try {
    return (JSON.parse(localStorage.getItem(key) || "null") as T) || emptyValue;
  } catch {
    return emptyValue;
  }
};

const useStoredState = <T extends object>(
  key: string,
  emptyValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => readStoredState(key, emptyValue));

  useEffect(() => {
    if (Object.keys(value).length > 0) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);

  return [value, setValue];
};

export const HistoryProvider: FC = ({ children }) => {
  const { readFile, writeFile } = useFileSystemActions();
  const [timeScale, setTimeScale] = useState<TimeScale>("week");
  const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
  const [blockedKeys, setBlockedKeys] = useStoredState<string[]>(
    BLOCKED_KEYS_IDB_NAME,
    []
  );
  const [deletedChats, setDeletedChats] = useStoredState<
    Record<string, number>
  >(DELETED_CHATS_IDB_NAME, {});
  const [profiles, setProfiles] = useState<Profiles>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (!readFile || initialized.current) return;

    initialized.current = true;

    readFile(SEEN_EVENT_IDS_PATH).then((eventIds) => {
      if (eventIds) {
        try {
          setSeenEventIds(JSON.parse(eventIds.toString()) as string[]);
        } catch {
          // Ignore failure to read seen events
        }
      }
    });
  }, [readFile]);

  useEffect(() => {
    if (!writeFile || !initialized.current) return;

    writeFile(SEEN_EVENT_IDS_PATH, JSON.stringify(seenEventIds), true);
  }, [seenEventIds, writeFile]);

  return (
    <HistoryContext
      value={{
        blockedKeys,
        deletedChats,
        profiles,
        seenEventIds,
        setBlockedKeys,
        setDeletedChats,
        setProfiles,
        setSeenEventIds,
        setTimeScale,
        timeScale,
      }}
    >
      {children}
    </HistoryContext>
  );
};
