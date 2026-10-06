import { useRef } from "react";
import { useNostrProfile } from "components/apps/Messenger/hooks";
import { useIsLegacyChat } from "components/apps/Messenger/MessageContext";
import Profile from "components/apps/Messenger/Profile";
import StyledChatProfile from "components/apps/Messenger/StyledChatProfile";
import { useIsVisible } from "hooks/useIsVisible";

const ChatProfile: FC<{ publicKey: string }> = ({ publicKey }) => {
  const elementRef = useRef<HTMLLIElement | null>(null);
  const isVisible = useIsVisible(elementRef);
  const { about, nip05, picture, userName } = useNostrProfile(
    publicKey,
    isVisible
  );
  const legacy = useIsLegacyChat(publicKey);

  return (
    <StyledChatProfile ref={elementRef}>
      <Profile
        nip05={nip05}
        picture={picture}
        pubkey={publicKey}
        userName={userName}
      >
        {about && <div className="about">{about}</div>}
        <div className="encryption">
          {legacy ? (
            <>
              <span>🔓 Legacy encryption</span>
              <span>
                Their app uses NIP-04, so replies use it too. Relays can see who
                is talking and when.
              </span>
            </>
          ) : (
            <>
              <span>🔐 End-to-end encrypted</span>
              <span>
                Messages are encrypted with NIP-44 and gift wrapped (NIP-17),
                hiding who sent them and when.
              </span>
            </>
          )}
        </div>
      </Profile>
    </StyledChatProfile>
  );
};

export default ChatProfile;
