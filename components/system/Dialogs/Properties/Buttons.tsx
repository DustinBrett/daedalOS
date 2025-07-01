import { memo } from "react";
import StyledButton from "components/system/Dialogs/StyledButton";
import { useProcesses } from "contexts/process";

type ButtonsProps = {
  id: string;
  onClick?: () => void;
};

const Buttons: FC<ButtonsProps> = ({ id, onClick }) => {
  const { closeWithTransition } = useProcesses();
  const close = (): void => closeWithTransition(id);

  return (
    <nav className="buttons">
      <StyledButton onClick={onClick || close}>OK</StyledButton>
      <StyledButton onClick={close}>Cancel</StyledButton>
    </nav>
  );
};

export default memo(Buttons);
