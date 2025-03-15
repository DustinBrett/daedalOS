import styled from "styled-components";
import StyledTaskbarButton from "components/system/Taskbar/StyledTaskbarButton";

const StyledSearchButton = styled(StyledTaskbarButton)`
  svg {
    border: 1px solid transparent;
    border-right: 0;
    border-top: 0;
    height: 17px;
    margin-left: -1px;

    path {
      stroke: #fff;
      stroke-width: 1;
    }
  }
`;

export default StyledSearchButton;
