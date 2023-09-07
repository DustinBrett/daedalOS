import { useNostrProfile } from "components/apps/Messenger/hooks";
import { useMemo } from "react";
import Button from "styles/common/Button";
import { Back } from "components/apps/FileExplorer/NavigationIcons";
import StyledProfileBanner from "components/apps/Messenger/StyledProfileBanner";
import { Avatar, Write } from "components/apps/Messenger/Icons";

const GRADIENT = "linear-gradient(rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.5))";
const STYLING =
  "center center / cover no-repeat fixed border-box border-box #000";

type ProfileBannerProps = {
  goHome: () => void;
  newChat: () => void;
  publicKey: string;
  selectedRecipientKey: string;
};

const ProfileBanner: FC<ProfileBannerProps> = ({
  goHome,
  newChat,
  selectedRecipientKey,
  publicKey,
}) => {
  const { banner, picture, userName } = useNostrProfile(
    selectedRecipientKey || publicKey
  );
  const style = useMemo(
    () =>
      banner ? { background: `${GRADIENT}, url(${banner}) ${STYLING}` } : {},
    [banner]
  );

  return (
    <StyledProfileBanner style={style}>
      {selectedRecipientKey ? (
        <Button onClick={goHome}>
          <Back />
        </Button>
      ) : (
        <Button className="write" onClick={newChat}>
          <Write />
        </Button>
      )}
      <figure>
        {picture ? <img alt={userName} src={picture} /> : <Avatar />}
        <figcaption>{userName}</figcaption>
      </figure>
    </StyledProfileBanner>
  );
};

export default ProfileBanner;
