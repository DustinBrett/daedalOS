import styled from "styled-components";

type StyledSidebarButtonProps = {
  active?: boolean;
};

const StyledSidebarButton = styled.li<StyledSidebarButtonProps>`
  border: 1px solid transparent;
  display: flex;
  height: 48px;
  place-content: center;
  place-items: center;
  width: 48px;

  &::before {
    border-left: ${({ active, theme }) =>
      `4px solid ${active ? theme.colors.highlight : "transparent"}`};
    content: "";
    height: 48px;
    position: absolute;
    width: 48px;
  }

  figure {
    color: ${({ active, theme }) =>
      active ? theme.colors.highlight : theme.colors.text};

    svg {
      fill: ${({ active, theme }) =>
        active ? theme.colors.highlight : theme.colors.text};
      height: 16px;
      margin-bottom: -1px;
      margin-left: 1px;
      width: 16px;
    }

    figcaption {
      display: none;
    }
  }

  &:hover {
    background-color: hsla(0, 0%, 35%, 70%);
    border: 1px solid hsla(0, 0%, 45%, 70%);
  }
`;

export default StyledSidebarButton;
