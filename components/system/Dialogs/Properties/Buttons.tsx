import { memo } from "react";
import StyledButton from "components/system/Dialogs/StyledButton";
import { useProcessesActions } from "contexts/process";

type ButtonsProps = {
  id: string;
  onClick?: () => void;
};

const Buttons: FC<ButtonsProps> = ({ id, onClick }) => {
  const { closeWithTransition } = useProcessesActions();
  const close = (): void => closeWithTransition(id);

  return (
    <nav className="buttons" role="presentation">
      <StyledButton onClick={onClick || close}>OK</StyledButton>
      <StyledButton onClick={close}>Cancel</StyledButton>
    </nav>
  );
};

export default memo(Buttons);
