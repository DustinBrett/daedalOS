import { memo, useId, useMemo, useState } from "react";
import { MAX_SUGGESTIONS } from "components/apps/Messenger/constants";
import {
  dataToProfile,
  decodePublicKey,
  NIP05_ADDRESS,
  resolveAddress,
} from "components/apps/Messenger/functions";
import { useHistoryContext } from "components/apps/Messenger/HistoryContext";
import { useFollows, useProfiles } from "components/apps/Messenger/hooks";
import Profile from "components/apps/Messenger/Profile";
import StyledTo from "components/apps/Messenger/StyledTo";
import Button from "styles/common/Button";

type ToProps = {
  knownKeys: string[];
  setRecipientKey: (key: string) => void;
};

const explainInvalidAddress = (address: string): string => {
  if (NIP05_ADDRESS.test(address)) {
    return `No Nostr account found for ${address}`;
  }

  if (address.startsWith("npub")) {
    return "That npub is shortened or incomplete. Use the full 63 character address, from Copy npub address in a profile's menu.";
  }

  return "Enter a name, npub, nprofile, hex key or name@domain address.";
};

const To: FC<ToProps> = ({ knownKeys, setRecipientKey }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const statusId = useId();
  const follows = useFollows();
  const { profiles } = useHistoryContext();
  const candidateKeys = useMemo(
    () => [...new Set([...knownKeys, ...follows])],
    [follows, knownKeys]
  );
  const suggestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return candidateKeys
      .filter((key) => {
        const { nip05 = "", npub = "", userName = "" } = profiles[key] || {};

        return (
          !term ||
          [nip05, npub, userName].some((value) =>
            value.toLowerCase().includes(term)
          )
        );
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [candidateKeys, profiles, search]);

  useProfiles(candidateKeys);

  return (
    <StyledTo>
      <input
        aria-describedby={status ? statusId : undefined}
        aria-label="To"
        onChange={({ currentTarget: { value } }) => {
          const publicKey = decodePublicKey(value);

          if (publicKey) setRecipientKey(publicKey);
          else {
            setSearch(value);
            setStatus("");
          }
        }}
        onKeyDown={async ({ currentTarget: { value }, key }) => {
          const address = value.trim();

          if (key !== "Enter" || !address) return;

          setStatus(`Looking up ${address}…`);

          const publicKey =
            (await resolveAddress(address, candidateKeys)) || suggestions[0];

          if (publicKey) setRecipientKey(publicKey);
          else setStatus(explainInvalidAddress(address));
        }}
        placeholder="Name, npub or name@domain"
        spellCheck={false}
        type="text"
        autoFocus
      />
      {status && (
        <div id={statusId} role="status">
          {status}
        </div>
      )}
      {suggestions.length > 0 && (
        <ol aria-label="Suggestions">
          {suggestions.map((key) => {
            const { nip05, picture, userName } =
              profiles[key] || dataToProfile(key);

            return (
              <li key={key}>
                <Button onClick={() => setRecipientKey(key)}>
                  <Profile
                    nip05={nip05}
                    picture={picture}
                    pubkey={key}
                    userName={userName}
                  />
                </Button>
              </li>
            );
          })}
        </ol>
      )}
    </StyledTo>
  );
};

export default memo(To);
