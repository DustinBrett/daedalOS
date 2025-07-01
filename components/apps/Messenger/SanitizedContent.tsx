import DOMPurify from "dompurify";
import { memo, useMemo } from "react";
import {
  convertImageLinksToHtml,
  convertNewLinesToBreaks,
} from "components/apps/Messenger/functions";

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
        __html: DOMPurify.sanitize(decryptedContent || content, {
          ALLOWED_ATTR: ["src"],
          ALLOWED_TAGS: ["br", "img"],
        }),
      }}
    />
  );
};

export default memo(SanitizedContent);
