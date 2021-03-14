import { WindowsIcon } from 'components/system/Icons';
import StyledStartButton from 'styles/components/system/Taskbar/StyledStartButton';

const StartButton = (): JSX.Element => (
  <StyledStartButton title="Start">
    <WindowsIcon />
  </StyledStartButton>
);

export default StartButton;
