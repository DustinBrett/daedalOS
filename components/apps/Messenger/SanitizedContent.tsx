import DOMPurify from "dompurify";
import {
  convertImageLinksToHtml,
  convertNewLinesToBreaks,
} from "components/apps/Messenger/functions";

// Messages are plain text, so markup in them is shown rather than parsed
const escapeHtml = (content: string): string =>
  content.replace(/["&'<>]/g, (char) => `&#${char.codePointAt(0)};`);

const SanitizedContent: FC<{ content: string }> = ({ content }) => (
  <div
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{
      __html: DOMPurify.sanitize(
        convertImageLinksToHtml(convertNewLinesToBreaks(escapeHtml(content))),
        { ALLOWED_ATTR: ["alt", "src"], ALLOWED_TAGS: ["br", "img"] }
      ),
    }}
  />
);

export default SanitizedContent;
