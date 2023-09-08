import { Avatar } from "components/apps/Messenger/Icons";

type ProfileProps = {
  picture?: string;
  userName?: string;
};

const Profile: FC<ProfileProps> = ({
  children,
  picture,
  userName = "Unknown",
}) => (
  <figure>
    {picture ? <img alt={userName} src={picture} /> : <Avatar />}
    <figcaption>
      <span>{userName}</span>
      {children}
    </figcaption>
  </figure>
);

export default Profile;
