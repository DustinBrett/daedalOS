import styled, { css } from "styled-components";

type StyledOpenTypeProps = {
  $drop?: boolean;
};

const StyledOpenType = styled.div<StyledOpenTypeProps>`
  font-size: 13px;
  overflow: hidden scroll;

  ${({ $drop }) =>
    $drop &&
    css`
      &::before {
        content: "Drop OTF/TTF/WOFF file here";
        display: flex;
        font-size: 16px;
        font-weight: 600;
        height: 100%;
        left: 0;
        place-content: center;
        place-items: center;
        position: absolute;
        top: 0;
        width: 100%;
      }
    `}

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
