import { useNostrProfile } from "components/apps/Messenger/hooks";
import { useMemo } from "react";
import Button from "styles/common/Button";
import StyledProfileBanner from "components/apps/Messenger/StyledProfileBanner";
import { Back, Write } from "components/apps/Messenger/Icons";
import { UNKNOWN_PUBLIC_KEY } from "components/apps/Messenger/constants";
import { haltEvent } from "utils/functions";
import Profile from "components/apps/Messenger/Profile";

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
  const {
    banner,
    picture,
    userName = "...",
  } = useNostrProfile(
    selectedRecipientKey === UNKNOWN_PUBLIC_KEY
      ? ""
      : selectedRecipientKey || publicKey
  );
  const style = useMemo(
    () =>
      banner ? { background: `${GRADIENT}, url(${banner}) ${STYLING}` } : {},
    [banner]
  );

  return (
    <StyledProfileBanner onContextMenuCapture={haltEvent} style={style}>
      <Button onClick={selectedRecipientKey ? goHome : newChat}>
        {selectedRecipientKey ? <Back /> : <Write />}
      </Button>
      <Profile picture={picture} userName={userName} />
    </StyledProfileBanner>
  );
};

export default ProfileBanner;
