import { type Filter } from "nostr-tools/filter";
import { type Event } from "nostr-tools/pure";
import { Relay } from "nostr-tools/relay";
import { normalizeURL } from "nostr-tools/utils";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  BASE_RW_RELAYS,
  RECONNECT_DELAYS_MS,
  RELAY_TIMEOUT_MS,
} from "components/apps/Messenger/constants";
import { type RelayStatus, type Signer } from "components/apps/Messenger/types";

interface NostrContextType {
  connectToRelay: (url: string) => void;
  publish: (event: Event, urls?: string[]) => Promise<boolean>;
  query: (filter: Filter) => Promise<Event[]>;
  relays: Relay[];
  relayStatus: Record<string, RelayStatus>;
  signer: Signer;
}

const NostrContext = createContext({} as NostrContextType);

export const useNostr = (): NostrContextType => useContext(NostrContext);

const publishWithAuth = (
  relay: Relay,
  event: Event,
  signer: Signer
): Promise<string> =>
  relay.publish(event).catch(async (error: unknown) => {
    if (!String(error).includes("auth-required")) throw error;

    await relay.auth(signer.signEvent);

    return relay.publish(event);
  });

export const NostrProvider: FC<{ signer: Signer }> = ({ children, signer }) => {
  const [relays, setRelays] = useState<Record<string, Relay>>({});
  const [connecting, setConnecting] = useState<string[]>([]);
  const openRelaysRef = useRef(new Set<Relay>());
  const initialConnections = useRef<Promise<unknown>>(Promise.resolve());
  const connectRef = useRef<(url: string) => void>(undefined);

  useEffect(() => {
    let active = true;
    const retryTimers = new Map<string, number>();
    const openRelays = new Set<Relay>();
    const connect = (url: string, attempt = 0): Promise<void> => {
      const relay = new Relay(url);
      const retry = (nextAttempt: number): void => {
        if (active && nextAttempt <= RECONNECT_DELAYS_MS.length) {
          retryTimers.set(
            url,
            window.setTimeout(
              () => connect(url, nextAttempt),
              RECONNECT_DELAYS_MS[nextAttempt - 1]
            )
          );
        }
      };

      window.clearTimeout(retryTimers.get(url));
      setConnecting((currentUrls) => [...currentUrls, url]);

      return relay
        .connect({ timeout: RELAY_TIMEOUT_MS })
        .then(() => {
          if (!active) {
            relay.close();
            return;
          }

          openRelays.add(relay);
          // eslint-disable-next-line unicorn/prefer-add-event-listener
          relay.onclose = () => {
            openRelays.delete(relay);
            setRelays((currentRelays) => {
              const remainingRelays = { ...currentRelays };

              delete remainingRelays[url];

              return remainingRelays;
            });
            retry(1);
          };
          setRelays((currentRelays) => ({ ...currentRelays, [url]: relay }));
        })
        .catch(() => retry(attempt + 1))
        .finally(() =>
          setConnecting((currentUrls) =>
            currentUrls.filter((currentUrl) => currentUrl !== url)
          )
        );
    };

    connectRef.current = connect;
    openRelaysRef.current = openRelays;
    initialConnections.current = Promise.allSettled(
      BASE_RW_RELAYS.map((url) => connect(url))
    );

    return () => {
      active = false;
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      openRelays.forEach((relay) => {
        // Skip CLOSE frames that would race the socket closing
        relay.openSubs.forEach((subscription) => {
          // eslint-disable-next-line no-param-reassign
          subscription.closed = true;
        });
        relay.close();
      });
      setRelays({});
    };
  }, []);

  const connectToRelay = (url: string): void => connectRef.current?.(url);
  const publish = async (
    event: Event,
    urls = BASE_RW_RELAYS
  ): Promise<boolean> => {
    const results = await Promise.allSettled(
      [...new Set(urls.map(normalizeURL))].map(async (url) => {
        const connectedRelay = [...openRelaysRef.current].find(
          (relay) => relay.url === url
        );

        if (connectedRelay) {
          return publishWithAuth(connectedRelay, event, signer);
        }

        const relay = await Relay.connect(url, { timeout: RELAY_TIMEOUT_MS });

        return publishWithAuth(relay, event, signer).finally(() =>
          relay.close()
        );
      })
    );

    return results.some(({ status }) => status === "fulfilled");
  };
  const query = async (filter: Filter): Promise<Event[]> => {
    await initialConnections.current;

    return new Promise((resolve) => {
      const events: Event[] = [];
      const connectedRelays = [...openRelaysRef.current];
      let remaining = connectedRelays.length;

      if (remaining === 0) resolve(events);

      connectedRelays.forEach((relay) => {
        let finished = false;
        const subscription = relay.subscribe([filter], {
          eoseTimeout: RELAY_TIMEOUT_MS,
          onclose: () => {
            if (finished) return;

            finished = true;
            remaining -= 1;

            if (remaining === 0) resolve(events);
          },
          oneose: () => subscription.close(),
          onevent: (event) => events.push(event),
        });
      });
    });
  };

  return (
    <NostrContext
      value={{
        connectToRelay,
        publish,
        query,
        relays: Object.values(relays),
        relayStatus: {
          ...Object.fromEntries(
            connecting.map((url): [string, RelayStatus] => [url, "connecting"])
          ),
          ...Object.fromEntries(
            Object.keys(relays).map((url): [string, RelayStatus] => [
              url,
              "connected",
            ])
          ),
        },
        signer,
      }}
    >
      {children}
    </NostrContext>
  );
};
