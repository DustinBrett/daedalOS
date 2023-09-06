import { ANON_AVATAR } from "components/apps/Messenger/constants";
import { useNostrProfile } from "components/apps/Messenger/hooks";
import { useMemo } from "react";
import Button from "styles/common/Button";
import { Back } from "components/apps/FileExplorer/NavigationIcons";
import StyledProfileBanner from "components/apps/Messenger/StyledProfileBanner";

const GRADIENT = "linear-gradient(rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.5))";
const STYLING =
  "center center / cover no-repeat fixed border-box border-box #000";

type ProfileBannerProps = {
  goHome: () => void;
  publicKey: string;
  selectedRecipientKey: string;
};

const ProfileBanner: FC<ProfileBannerProps> = ({
  goHome,
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
        <div />
      )}
      <figure>
        <img alt={userName} src={picture || ANON_AVATAR} />
        <figcaption>{userName}</figcaption>
      </figure>
    </StyledProfileBanner>
  );
};

export default ProfileBanner;
