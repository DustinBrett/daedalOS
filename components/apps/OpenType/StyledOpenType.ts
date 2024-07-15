import styled from "styled-components";
import Message from "styles/common/Message";

const StyledOpenType = styled.div`
  font-size: 13px;
  overflow: hidden auto;

  &.drop {
    ${Message("Drop OTF/TTF/WOFF file here", "#000")};
  }

  ol {
    &:not(:last-child) {
      border-bottom: 1px solid #000;
    }

    padding: 2px 0;
  }

  figure {
    align-items: center;
    display: flex;
    padding-top: 2px;

    figcaption {
      padding-right: 15px;
    }
  }
`;

export default StyledOpenType;
