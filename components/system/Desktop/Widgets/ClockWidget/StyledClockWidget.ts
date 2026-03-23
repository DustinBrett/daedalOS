import styled from "styled-components";
import StyledWidget from "components/system/Desktop/Widgets/StyledWidget";

const StyledClockWidget = styled(StyledWidget)`
  min-width: 220px;

  .clock-time {
    font-size: 48px;
    font-weight: 200;
    letter-spacing: -1px;
    line-height: 1;
    padding: 6px 14px 0;
  }

  .clock-date {
    font-size: 13px;
    opacity: 80%;
    padding: 6px 14px 14px;
  }
`;

export default StyledClockWidget;
