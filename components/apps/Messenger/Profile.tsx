import { Avatar, Verified } from "components/apps/Messenger/Icons";
import { useVerified } from "components/apps/Messenger/hooks";
import StyledProfile from "components/apps/Messenger/StyledProfile";
import { useState } from "react";

type ProfileProps = {
  nip05?: string;
  picture?: string;
  pubkey?: string;
  userName?: string;
};

const Profile: FC<ProfileProps> = ({
  children,
  nip05,
  picture,
  pubkey,
  userName = "Unknown",
}) => {
  const verified = useVerified(nip05, pubkey);
  const [loadedImage, setLoadedImage] = useState("");

  return (
    <StyledProfile>
      <div>
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
        {verified && (
          <div className="verified">
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
