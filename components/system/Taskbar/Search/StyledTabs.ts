import styled from "styled-components";

const StyledTabs = styled.ol`
  border-bottom: 1px solid hsla(0, 0%, 13%, 40%);
  color: #fbf1c7;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  gap: 1px;
  padding: 2px 13px 0;

  li {
    color: rgb(213, 196, 161);
    padding: 15px 13px 14px;

    &.active {
      border-bottom: 4px solid rgb(66, 123, 88);
      color: #fbf1c7;
    }

    &:hover {
      color: #fbf1c7;
    }
  }
`;

export default StyledTabs;
