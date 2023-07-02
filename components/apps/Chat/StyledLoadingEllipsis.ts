import styled from "styled-components";

type StyledLoadingEllipsisProps = {
  $showLoading: boolean;
};

const StyledLoadingEllipsis = styled.span<StyledLoadingEllipsisProps>`
  height: 32px;
  opacity: ${({ $showLoading }) => ($showLoading ? "100%" : "0%")};
  position: absolute;
  right: 24px;
  top: 18px;
  transition: opacity 0.1s ease-in-out;
  width: 32px;

  &::after {
    animation: ellipsis steps(4, end) 900ms infinite;
    color: rgb(142, 142, 160);
    content: "";
    font-size: 25px;
    letter-spacing: 0.5px;
  }

  @keyframes ellipsis {
    0% {
      content: ".";
    }

    50% {
      content: "..";
    }

    100% {
      content: "...";
    }
  }
`;

export default StyledLoadingEllipsis;
