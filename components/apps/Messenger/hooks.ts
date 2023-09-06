import { useNostrEvents, useProfile } from "nostr-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getReceivedMessages,
  getSentMessages,
  getKeyFromTags,
  descCreatedAt,
  toHexKey,
  getPublicHexKey,
  maybeGetExistingPublicKey,
} from "components/apps/Messenger/functions";
import { nip19 } from "nostr-tools";
import type { NIP05Result } from "nostr-tools/lib/nip05";
import type {
  NostrProfile,
  NostrContacts,
} from "components/apps/Messenger/types";
import { shallowEqual } from "utils/functions";

type ProfileData = ReturnType<typeof useProfile>["data"];

const dataToProfile = (publicKey: string, data?: ProfileData): NostrProfile => {
  const {
    about,
    banner,
    display_name,
    name,
    npub,
    picture,
    username,
    website,
  } = data || {};

  return {
    about,
    banner,
    picture,
    userName:
      display_name ||
      name ||
      username ||
      (npub || nip19.npubEncode(publicKey)).slice(0, 12),
    website,
  };
};

export const useNostrProfile = (publicKey: string): NostrProfile => {
  const [profile, setProfile] = useState<ProfileData>({} as ProfileData);
  const { data, isLoading, onDone } = useProfile({ pubkey: publicKey });

  useEffect(() => {
    if (profile && shallowEqual(data, profile)) return;

    // TODO: Make custom/reliable profile(s) hook with useNostrEvents
    if (isLoading) onDone(() => setProfile(data));
    setProfile(data);
  }, [data, isLoading, onDone, profile]);

  return dataToProfile(publicKey, profile);
};

export const useNip05 = (): NIP05Result => {
  const [nip05, setNip05] = useState<NIP05Result>();
  const updateNip05 = useCallback(async (url: string): Promise<boolean> => {
    const nostrJson = await fetch(url);

    if (nostrJson.ok) {
      const { names = {}, relays = {} } =
        ((await nostrJson.json()) as NIP05Result) || {};

      setNip05({ names, relays });
    }

    return nostrJson.ok;
  }, []);
  const fetchNip05Json = useCallback(
    async (): Promise<boolean> =>
      (await updateNip05("/.well-known/nostr.json")) ||
      updateNip05("/nostr.json"),
    [updateNip05]
  );

  useEffect(() => {
    if (!nip05) fetchNip05Json();
  }, [fetchNip05Json, nip05]);

  return nip05 || ({} as NIP05Result);
};

export const useNostrContacts = (
  publicKey: string,
  wellKnownNames: Record<string, string>
): NostrContacts => {
  const globalContacts = useMemo(
    () => Object.values(wellKnownNames).map((key) => toHexKey(key)),
    [wellKnownNames]
  );
  const receivedEvents = useNostrEvents(getReceivedMessages(publicKey));
  const sentEvents = useNostrEvents(getSentMessages(publicKey));
  const events = useMemo(
    () => [...receivedEvents.events, ...sentEvents.events],
    [receivedEvents, sentEvents]
  );
  const contactKeys = useMemo(() => {
    const keys = new Set(
      events
        .map(({ pubkey, tags }) =>
          pubkey === publicKey ? getKeyFromTags(tags) || "" : pubkey
        )
        .filter((pubkey) => !globalContacts.includes(pubkey))
    );

    return [...globalContacts, ...keys].filter((key) => key !== publicKey);
  }, [events, globalContacts, publicKey]);
  const lastEvents = useMemo(
    () =>
      Object.fromEntries(
        contactKeys.map((pubkey) => [
          pubkey,
          events
            .filter((event) =>
              [event.pubkey, getKeyFromTags(event.tags)].includes(pubkey)
            )
            .sort(descCreatedAt)[0],
        ])
      ),
    [contactKeys, events]
  );

  return { contactKeys, events, lastEvents };
};

export const usePublicKey = (): string => {
  const [publicKey, setPublicKey] = useState<string>("");

  useEffect(() => {
    maybeGetExistingPublicKey().then(getPublicHexKey).then(setPublicKey);
  }, []);

  return publicKey;
};
