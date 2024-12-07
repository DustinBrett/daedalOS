import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Event } from "nostr-tools";
import { SEEN_EVENT_IDS_PATH } from "components/apps/Messenger/constants";
import { type NostrProfile } from "components/apps/Messenger/types";
import { useFileSystem } from "contexts/fileSystem";

type Profiles = Record<string, NostrProfile>;

export type TimeScale = "day" | "week" | "month" | "trimester" | "infinite";

type History = {
  outgoingEvents: Event[];
  profiles: Profiles;
  seenEventIds: string[];
  setOutgoingEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setProfiles: React.Dispatch<React.SetStateAction<Profiles>>;
  setSeenEventIds: React.Dispatch<React.SetStateAction<string[]>>;
  setTimeScale: React.Dispatch<React.SetStateAction<TimeScale>>;
  timeScale: TimeScale;
};

const HistoryContext = createContext({} as History);

export const useHistoryContext = (): History => useContext(HistoryContext);

export const HistoryProvider = memo<FC>(({ children }) => {
  const { readFile, writeFile } = useFileSystem();
  const [timeScale, setTimeScale] = useState<TimeScale>("day");
  const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
  const [outgoingEvents, setOutgoingEvents] = useState<Event[]>([]);
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
      value={useMemo(
        () => ({
          outgoingEvents,
          profiles,
          seenEventIds,
          setOutgoingEvents,
          setProfiles,
          setSeenEventIds,
          setTimeScale,
          timeScale,
        }),
        [outgoingEvents, profiles, seenEventIds, timeScale]
      )}
    >
      {children}
    </HistoryContext>
  );
});
