import { sanitize } from "dompurify";

const SanitizedContent: FC<{ content: string }> = ({ content }) => (
  <div
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{
      __html: sanitize(content, {
        ALLOWED_ATTR: ["src"],
        ALLOWED_TAGS: ["br", "img"],
      }),
    }}
  />
);

export default SanitizedContent;
