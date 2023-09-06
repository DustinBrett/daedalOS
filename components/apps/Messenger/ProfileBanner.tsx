import StyledProfile from "components/apps/Messenger/StyledProfile";
import { ANON_AVATAR } from "components/apps/Messenger/constants";
import { useNostrProfile } from "components/apps/Messenger/hooks";
import { useMemo } from "react";

const GRADIENT = "linear-gradient(rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.5))";
const STYLING =
  "center center / cover no-repeat fixed border-box border-box #000";

const ProfileBanner: FC<{ publicKey: string }> = ({ publicKey }) => {
  const { banner, picture, userName } = useNostrProfile(publicKey);
  const style = useMemo(
    () =>
      banner ? { background: `${GRADIENT}, url(${banner}) ${STYLING}` } : {},
    [banner]
  );

  return (
    <StyledProfile style={style}>
      <span>{userName}</span>
      <img alt={userName} src={picture || ANON_AVATAR} />
    </StyledProfile>
  );
};

export default ProfileBanner;
