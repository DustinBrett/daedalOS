import { WindowsIcon } from 'components/system/Icons';
import StyledStartButton from 'components/system/Taskbar/StartButton/StyledStartButton';

const StartButton = (): JSX.Element => (
  <StyledStartButton title="Start">
    <WindowsIcon />
  </StyledStartButton>
);

export default StartButton;
