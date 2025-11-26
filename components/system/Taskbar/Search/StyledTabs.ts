import styled from "styled-components";

const StyledTabs = styled.ol`
  border-bottom: 1px solid hsl(0 0% 13% / 40%);
  color: #fff;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  gap: 1px;
  padding: 2px 13px 0;
  position: absolute;
  width: 100%;

  li {
    color: rgb(215 215 215);
    padding: 15px 13px 14px;

    &.active {
      border-bottom: 4px solid rgb(0 120 215);
      color: #fff;
    }

    &:hover {
      color: #fff;
    }
  }
`;

export default StyledTabs;
