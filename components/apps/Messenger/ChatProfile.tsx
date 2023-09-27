import Profile from "components/apps/Messenger/Profile";
import StyledChatProfile from "components/apps/Messenger/StyledChatProfile";
import { useIsVisible, useNostrProfile } from "components/apps/Messenger/hooks";
import { useRef } from "react";

const ChatProfile: FC<{ publicKey: string }> = ({ publicKey }) => {
  const elementRef = useRef<HTMLLIElement | null>(null);
  const isVisible = useIsVisible(elementRef);
  const { about, nip05, picture, userName } = useNostrProfile(
    publicKey,
    isVisible
  );

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
          <span>🔐 End-to-end encrypted</span>
          <span>Messages are secured with AES256-CBC encryption.</span>
        </div>
      </Profile>
    </StyledChatProfile>
  );
};

export default ChatProfile;
