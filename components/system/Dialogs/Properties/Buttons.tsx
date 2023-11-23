import StyledButton from "components/system/Dialogs/StyledButton";
import { useProcesses } from "contexts/process";

type ButtonsProps = {
  id: string;
  onClick: () => void;
};

const Buttons: FC<ButtonsProps> = ({ id, onClick }) => {
  const { closeWithTransition } = useProcesses();

  return (
    <nav className="buttons">
      <StyledButton onClick={onClick}>OK</StyledButton>
      <StyledButton onClick={() => closeWithTransition(id)}>
        Cancel
      </StyledButton>
    </nav>
  );
};

export default Buttons;
