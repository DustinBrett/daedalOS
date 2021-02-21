import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StyledStartButton from 'styles/components/system/Taskbar/StyledStartButton';

const StartButton = (): JSX.Element => (
  <StyledStartButton title="Start">
    <FontAwesomeIcon icon={faWindows} />
  </StyledStartButton>
);

export default StartButton;
