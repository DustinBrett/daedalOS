import type { Event as NostrEvent, Relay } from "nostr-tools";
import { relayInit } from "nostr-tools";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface NostrContextType {
  connectedRelays: Relay[];
  publish: (event: NostrEvent) => Promise<void>;
}

const NostrContext = createContext<NostrContextType>({
  connectedRelays: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  publish: async () => {},
});

export const useNostr = (): NostrContextType => useContext(NostrContext);

export const NostrProvider: FC<{ relayUrls: string[] }> = ({
  children,
  relayUrls,
}) => {
  const [connectedRelays, setConnectedRelays] = useState<Record<string, Relay>>(
    {}
  );
  const [knownRelays, setKnownRelays] = useState<string[]>([]);
  const disconnectToRelays = useCallback((urls: string[]) => {
    if (urls.length === 0) return;

    setConnectedRelays((currentConnectedRelays) => {
      const newConnectedRelays = { ...currentConnectedRelays };

      urls.forEach((url) => {
        newConnectedRelays[url]?.close();
        delete newConnectedRelays[url];
      });

      return newConnectedRelays;
    });
  }, []);
  const connectToRelays = useCallback(
    (urls: string[]) =>
      urls.forEach((url) => {
        if (connectedRelays[url]) return;

        const relay = relayInit(url);

        relay.connect();
        relay.on("connect", () =>
          setConnectedRelays((currentConnectedRelays) => ({
            ...currentConnectedRelays,
            [url]: relay,
          }))
        );
        relay.on("disconnect", () =>
          setConnectedRelays(
            ({ [url]: _previouslyConnectedRelay, ...newConnectedRelays }) =>
              newConnectedRelays
          )
        );
        relay.on("error", console.error);
      }),
    [connectedRelays]
  );
  const publish = useCallback(
    async (event: NostrEvent) => {
      await Promise.all(
        Object.values(connectedRelays).map((relay) => relay.publish(event))
      );
    },
    [connectedRelays]
  );

  useEffect(() => {
    if (
      relayUrls.length === knownRelays.length &&
      relayUrls.every((url) => knownRelays.includes(url))
    ) {
      return;
    }

    disconnectToRelays(knownRelays.filter((url) => !relayUrls.includes(url)));
    connectToRelays(relayUrls);
    setKnownRelays(relayUrls);
  }, [connectToRelays, disconnectToRelays, knownRelays, relayUrls]);

  return (
    <NostrContext.Provider
      value={useMemo(
        () => ({
          connectedRelays: Object.values(connectedRelays),
          publish,
        }),
        [connectedRelays, publish]
      )}
    >
      {children}
    </NostrContext.Provider>
  );
};
