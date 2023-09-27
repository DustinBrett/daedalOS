import type { NostrProfile } from "components/apps/Messenger/types";
import type { Event } from "nostr-tools";
import { createContext, memo, useContext, useMemo, useState } from "react";

type Profiles = Record<string, NostrProfile>;

type History = {
  outgoingEvents: Event[];
  profiles: Profiles;
  seenEventIds: string[];
  setOutgoingEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setProfiles: React.Dispatch<React.SetStateAction<Profiles>>;
  setSeenEventIds: React.Dispatch<React.SetStateAction<string[]>>;
};

const HistoryContext = createContext({} as History);

export const useHistoryContext = (): History => useContext(HistoryContext);

export const HistoryProvider = memo<FC>(({ children }) => {
  const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
  const [outgoingEvents, setOutgoingEvents] = useState<Event[]>([]);
  const [profiles, setProfiles] = useState<Profiles>({});

  return (
    <HistoryContext.Provider
      value={useMemo(
        () => ({
          outgoingEvents,
          profiles,
          seenEventIds,
          setOutgoingEvents,
          setProfiles,
          setSeenEventIds,
        }),
        [outgoingEvents, profiles, seenEventIds]
      )}
    >
      {children}
    </HistoryContext.Provider>
  );
});
