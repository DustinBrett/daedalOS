import { Avatar, Verified } from "components/apps/Messenger/Icons";
import StyledProfile from "components/apps/Messenger/StyledProfile";
import { useNip05Domain } from "components/apps/Messenger/hooks";
import { useState } from "react";

type ProfileProps = {
  nip05?: string;
  onClick?: () => void;
  picture?: string;
  pubkey?: string;
  userName?: string;
};

const Profile: FC<ProfileProps> = ({
  children,
  nip05,
  onClick,
  picture,
  pubkey,
  userName = "Unknown",
}) => {
  const verifiedDomain = useNip05Domain(nip05, pubkey);
  const [loadedImage, setLoadedImage] = useState("");

  return (
    <StyledProfile $clickable={Boolean(onClick)}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={onClick}>
        {picture && (
          <img
            alt={userName}
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
          <div className="verified" title={verifiedDomain}>
            <Verified />
          </div>
        )}
      </div>
      <figcaption>
        <span>{userName}</span>
        {children}
      </figcaption>
    </StyledProfile>
  );
};

export default Profile;
