import { memo, useCallback, useMemo } from "react";
import { useHistoryContext } from "components/apps/Messenger/HistoryContext";
import { Back, Write } from "components/apps/Messenger/Icons";
import { useNostr } from "components/apps/Messenger/NostrContext";
import Profile from "components/apps/Messenger/Profile";
import StyledProfileBanner from "components/apps/Messenger/StyledProfileBanner";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import {
  copyKeyMenuItems,
  createProfileEvent,
  dataToProfile,
  getPrivateKey,
  getWebSocketStatusIcon,
} from "components/apps/Messenger/functions";
import { useNostrProfile } from "components/apps/Messenger/hooks";
import { type ProfileData } from "components/apps/Messenger/types";
import { useMenu } from "contexts/menu";
import Button from "styles/common/Button";
import { MENU_SEPERATOR } from "utils/constants";
import { haltEvent, toSorted } from "utils/functions";

const GRADIENT = "linear-gradient(rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.5))";
const STYLING =
  "center center / cover no-repeat local border-box border-box #000";

type ProfileBannerProps = {
  goHome: () => void;
  hideReadMessages: boolean;
  newChat: () => void;
  publicKey: string;
  relayUrls: string[];
  selectedRecipientKey: string;
  setHideReadMessages: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfileBanner: FC<ProfileBannerProps> = ({
  goHome,
  hideReadMessages,
  newChat,
  publicKey,
  relayUrls,
  selectedRecipientKey,
  setHideReadMessages,
}) => {
  const pubkey =
    selectedRecipientKey === UNKNOWN_PUBLIC_KEY
      ? ""
      : selectedRecipientKey || publicKey;
  const {
    banner,
    data,
    nip05,
    picture,
    userName = "New message",
  } = useNostrProfile(pubkey);
  const { connectToRelays, connectedRelays } = useNostr();
  const connectedRelayData = useMemo(
    () =>
      Object.fromEntries(
        connectedRelays.map(({ url, status }) => [url, status])
      ),
    [connectedRelays]
  );
  const style = useMemo(
    () =>
      banner ? { background: `${GRADIENT}, url(${banner}) ${STYLING}` } : {},
    [banner]
  );
  const { contextMenu } = useMenu();
  const { publish } = useNostr();
  const { setProfiles } = useHistoryContext();
  const updateProfile = useCallback(
    async (newProfile: Partial<ProfileData>) => {
      if (Object.values(newProfile).filter(Boolean).length === 0) return;

      try {
        const content = data ? Object.assign(data, newProfile) : newProfile;
        const event = await createProfileEvent(content);

        publish(event);
        setProfiles((currentProfiles) => ({
          ...currentProfiles,
          [pubkey]: dataToProfile(publicKey, content),
        }));
      } catch {
        // Ignore errors publishing profile data
      }
    },
    [data, pubkey, publicKey, publish, setProfiles]
  );
  const { onContextMenuCapture } = useMemo(
    () =>
      /* eslint-disable no-alert */
      contextMenu?.(() => [
        ...copyKeyMenuItems(selectedRecipientKey || pubkey, getPrivateKey()),
        ...(pubkey && !selectedRecipientKey
          ? [
              MENU_SEPERATOR,
              {
                action: () =>
                  updateProfile({ username: prompt("Username") || "" }),
                label: "Edit Username",
              },
              MENU_SEPERATOR,
              {
                action: () =>
                  updateProfile({ picture: prompt("Picture URL") || "" }),
                label: "Edit Picture",
              },
              {
                action: () =>
                  updateProfile({ banner: prompt("Banner URL") || "" }),
                label: "Edit Banner",
              },
              MENU_SEPERATOR,
              {
                action: () => setHideReadMessages(!hideReadMessages),
                label: `${hideReadMessages ? "Show" : "Hide"} Read Messages`,
              },
            ]
          : []),
      ]),
    /* eslint-enable no-alert */
    [
      contextMenu,
      hideReadMessages,
      pubkey,
      selectedRecipientKey,
      setHideReadMessages,
      updateProfile,
    ]
  );

  return (
    <StyledProfileBanner onContextMenuCapture={haltEvent} style={style}>
      <Button onClick={selectedRecipientKey ? goHome : newChat}>
        {selectedRecipientKey ? <Back /> : <Write />}
      </Button>
      {!selectedRecipientKey && connectedRelays.length > 0 && (
        <div className="relays">
          <ol>
            {toSorted(relayUrls).map((relayUrl) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={relayUrl}
                onClick={
                  connectedRelayData[relayUrl]
                    ? undefined
                    : () => connectToRelays([relayUrl])
                }
                title={relayUrl}
              >
                {getWebSocketStatusIcon(connectedRelayData[relayUrl])}
              </li>
            ))}
          </ol>
        </div>
      )}
      <Profile
        nip05={nip05}
        onMouseDown={onContextMenuCapture}
        picture={picture}
        pubkey={pubkey}
        userName={userName}
      />
    </StyledProfileBanner>
  );
};

export default memo(ProfileBanner);
