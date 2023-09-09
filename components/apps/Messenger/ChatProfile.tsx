import Profile from "components/apps/Messenger/Profile";
import StyledChatProfile from "components/apps/Messenger/StyledChatProfile";
import { useNostrProfile } from "components/apps/Messenger/hooks";

const ChatProfile: FC<{ publicKey: string }> = ({ publicKey }) => {
  const { about, nip05, picture, userName } = useNostrProfile(publicKey);

  return (
    <StyledChatProfile>
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
