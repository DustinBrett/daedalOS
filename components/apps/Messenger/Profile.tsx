import { useState } from "react";
import { useNip05Domain } from "components/apps/Messenger/hooks";
import { Avatar, Verified } from "components/apps/Messenger/Icons";
import StyledProfile from "components/apps/Messenger/StyledProfile";
import { label } from "utils/functions";

export const PROFILE = "Profile";

type ProfileProps = {
  captionId?: string;
  expanded?: boolean;
  nip05?: string;
  onClick?: React.MouseEventHandler;
  picture?: string;
  pubkey?: string;
  userName?: string;
};

const Profile: FC<ProfileProps> = ({
  captionId,
  children,
  expanded,
  nip05,
  onClick,
  picture,
  pubkey,
  userName = "Unknown",
}) => {
  const verifiedDomain = useNip05Domain(nip05, pubkey);
  const [loadedImage, setLoadedImage] = useState("");
  const avatar = (
    <>
      {picture && (
        <img
          alt=""
          onLoad={() => setLoadedImage(picture)}
          src={picture}
          style={
            loadedImage === picture
              ? {}
              : { position: "absolute", visibility: "hidden" }
          }
        />
      )}
      {(!picture || loadedImage !== picture) && <Avatar />}
      {verifiedDomain && (
        <div className="verified" role="img" {...label(verifiedDomain)}>
          <Verified />
        </div>
      )}
    </>
  );

  return (
    <StyledProfile $clickable={Boolean(onClick)}>
      {onClick ? (
        <button
          aria-expanded={expanded}
          aria-haspopup="menu"
          onClick={onClick}
          type="button"
          {...label(PROFILE)}
        >
          {avatar}
        </button>
      ) : (
        <div>{avatar}</div>
      )}
      <figcaption id={captionId}>
        <span>{userName}</span>
        {children}
      </figcaption>
    </StyledProfile>
  );
};

export default Profile;
