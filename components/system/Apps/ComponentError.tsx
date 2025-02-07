import { memo } from "react";
import styled from "styled-components";

const StyledComponentError = styled.div`
  background-color: #fff;
  color: #000;
  display: flex;
  font-size: 20px;
  height: 100%;
  place-content: center;
  place-items: center;
  width: 100%;
`;

const ERROR_MESSAGE = "Error occurred within component.";

const ComponentError: FC = () => (
  <StyledComponentError>{ERROR_MESSAGE}</StyledComponentError>
);

export default memo(ComponentError);
