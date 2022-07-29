import styled from "styled-components";

const StyledComponentError = styled.div`
  display: flex;
  font-size: 22px;
  height: 100%;
  mix-blend-mode: difference;
  place-content: center;
  place-items: center;
  width: 100%;
`;

const ERROR_MESSAGE = "Error occured while loading component.";

const ComponentError: FC = () => (
  <StyledComponentError>{ERROR_MESSAGE}</StyledComponentError>
);

export default ComponentError;
