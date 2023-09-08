import StyledTo from "components/apps/Messenger/StyledTo";

type ToProps = { setRecipientKey: (key: string) => boolean };

const To: FC<ToProps> = ({ setRecipientKey }) => (
  <StyledTo>
    <input
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          !setRecipientKey(event.currentTarget.value)
        ) {
          // eslint-disable-next-line no-param-reassign
          event.currentTarget.value = "";
        }
      }}
      placeholder="Type a Nostr address (npub/nprofile/hex)"
      spellCheck={false}
      type="text"
      autoFocus
    />
  </StyledTo>
);

export default To;
