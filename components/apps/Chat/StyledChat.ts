import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

const StyledChat = styled.div`
  background-color: rgb(68, 70, 84);
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  ul {
    ${ScrollBars(DEFAULT_SCROLLBAR_WIDTH)};

    overflow-y: scroll;
    height: 100%;
    padding-bottom: 84px;
    position: relative;
  }
`;

export default StyledChat;
