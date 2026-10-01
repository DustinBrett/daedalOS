import { type Event as NostrEvent, type Relay, relayInit } from "nostr-tools";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface NostrContextType {
  connectedRelays: Relay[];
  connectToRelays: (urls: string[]) => void;
  publish: (event: NostrEvent) => void;
}

/* eslint-disable @typescript-eslint/no-empty-function */
const NostrContext = createContext<NostrContextType>({
  connectedRelays: [],
  connectToRelays: () => {},
  publish: () => {},
});
/* eslint-enable @typescript-eslint/no-empty-function */

export const useNostr = (): NostrContextType => useContext(NostrContext);

const NostrProviderFC: FC<{ relayUrls: string[] }> = ({
  children,
  relayUrls,
}) => {
  const [connectedRelays, setConnectedRelays] = useState<Record<string, Relay>>(
    {}
  );
  const knownRelaysRef = useRef<string[]>([]);
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
        relay.connect();
      }),
    [connectedRelays]
  );
  const publish = useCallback(
    (event: NostrEvent) =>
      Object.values(connectedRelays).forEach((relay) => relay.publish(event)),
    [connectedRelays]
  );

  useEffect(() => {
    const { current: knownRelays } = knownRelaysRef;

    if (
      relayUrls.length === knownRelays.length &&
      relayUrls.every((url) => knownRelays.includes(url))
    ) {
      return;
    }

    disconnectToRelays(knownRelays.filter((url) => !relayUrls.includes(url)));
    connectToRelays(relayUrls);

    knownRelaysRef.current = relayUrls;
  }, [connectToRelays, disconnectToRelays, relayUrls]);

  return (
    <NostrContext
      value={useMemo(
        () => ({
          connectedRelays: Object.values(connectedRelays),
          connectToRelays,
          publish,
        }),
        [connectToRelays, connectedRelays, publish]
      )}
    >
      {children}
    </NostrContext>
  );
};

export const NostrProvider = memo(NostrProviderFC);
