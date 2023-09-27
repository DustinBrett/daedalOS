import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

const StyledChat = styled.div`
  background-color: rgb(60, 56, 54);
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  > button {
    fill: rgba(168, 153, 132, 75%);
    margin: 3px;
    padding: 4px;
    position: absolute;
    right: ${DEFAULT_SCROLLBAR_WIDTH}px;
    width: 24px;
    z-index: 1;

    &:hover {
      fill: rgba(168, 153, 132, 75%);
    }
  }

  .sub-margin {
    margin: -2px;
  }

  > ul {
    ${ScrollBars()};
    height: 100%;
    overflow-y: scroll;
    padding-bottom: 84px;
    position: relative;
  }
`;

export default StyledChat;
