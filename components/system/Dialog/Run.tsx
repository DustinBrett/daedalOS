import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledButton from "components/system/Dialog/StyledButton";
import StyledRun from "components/system/Dialog/StyledRun";
import { useProcesses } from "contexts/process";

const Run: FC<ComponentProcessProps> = () => {
  const { open } = useProcesses();
  // TODO: SHIFT + R
  return (
    <StyledRun>
      <figure>
        <img alt="Run" src="/System/Icons/32x32/run.webp" />
        <figcaption>
          Type the name of a program, folder, document, or Internet resource,
          and daedalOS will open it for you.
        </figcaption>
      </figure>
      <div>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="open">Open:</label>
        {/* TODO: Enter to open */}
        <input id="open" type="text" />
      </div>
      <nav>
        {/* TODO: Default button */}
        <StyledButton
          onClick={() => {
            // TODO: Use ref
            open(
              (document.querySelector("#open") as HTMLInputElement)?.value ?? ""
            );
            // TODO: Clear/close dialog
            console.info("TODO: OK");
          }}
        >
          OK
        </StyledButton>
        <StyledButton onClick={() => console.info("TODO: Cancel")}>
          Cancel
        </StyledButton>
      </nav>
    </StyledRun>
  );
};

export default Run;
