import type { NostrProfile } from "components/apps/Messenger/types";
import { useNostrEvents } from "nostr-react";
import { createContext, memo, useContext, useState } from "react";
import { dataToProfile } from "components/apps/Messenger/functions";
import { type Metadata } from "nostr-react";

type Profiles = Record<string, NostrProfile>;
type ProfileState = [Profiles, React.Dispatch<React.SetStateAction<Profiles>>];

const ProfileContext = createContext([
  Object.create(null),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  () => {},
] as ProfileState);

const useProfileContext = (): ProfileState => useContext(ProfileContext);

export const useNostrProfile = (
  publicKey: string
): NostrProfile & {
  setProfiles: React.Dispatch<React.SetStateAction<Profiles>>;
} => {
  const [profiles, setProfiles] = useProfileContext();
  const { onEvent } = useNostrEvents({
    enabled: !!publicKey,
    filter: {
      authors: [publicKey],
      kinds: [0],
    },
  });

  onEvent(({ content, pubkey }) => {
    if (!publicKey || publicKey !== pubkey) return;

    try {
      const metadata = JSON.parse(content) as Metadata;

      if (metadata) {
        setProfiles((currentProfiles) => ({
          ...currentProfiles,
          [publicKey]: dataToProfile(publicKey, metadata),
        }));
      }
    } catch {
      // Ignore errors parsing profile data
    }
  });

  return {
    ...(publicKey ? profiles[publicKey] || dataToProfile(publicKey) : {}),
    setProfiles,
  };
};

export const ProfileProvider = memo<FC>(({ children }) => (
  <ProfileContext.Provider
    // eslint-disable-next-line react/hook-use-state
    value={useState<Profiles>(Object.create(null) as Profiles)}
  >
    {children}
  </ProfileContext.Provider>
));
