import { memo, useState } from "react";
import { Avatar, Verified } from "components/apps/Messenger/Icons";
import StyledProfile from "components/apps/Messenger/StyledProfile";
import { useNip05Domain } from "components/apps/Messenger/hooks";
import { label } from "utils/functions";

type ProfileProps = {
  nip05?: string;
  onClick?: React.MouseEventHandler;
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
        <div className="verified" title={verifiedDomain}>
          <Verified />
        </div>
      )}
    </>
  );

  return (
    <StyledProfile $clickable={Boolean(onClick)}>
      {onClick ? (
        <button onClick={onClick} type="button" {...label("Profile")}>
          {avatar}
        </button>
      ) : (
        <div>{avatar}</div>
      )}
      <figcaption>
        <span>{userName}</span>
        {children}
      </figcaption>
    </StyledProfile>
  );
};

export default memo(Profile);
