import {
  convertImageLinksToHtml,
  convertNewLinesToBreaks,
} from "components/apps/Messenger/functions";
import { sanitize } from "dompurify";
import { useMemo } from "react";

const SanitizedContent: FC<{ content: string; decrypted: boolean }> = ({
  content,
  decrypted,
}) => {
  const decryptedContent = useMemo(
    () =>
      decrypted
        ? convertImageLinksToHtml(convertNewLinesToBreaks(content))
        : "",
    [content, decrypted]
  );

  return (
    <div
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: sanitize(decryptedContent || content, {
          ALLOWED_ATTR: ["src"],
          ALLOWED_TAGS: ["br", "img"],
        }),
      }}
    />
  );
};

export default SanitizedContent;
