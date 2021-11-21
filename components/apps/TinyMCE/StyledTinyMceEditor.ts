import styled from "styled-components";

const StyledEditor = styled.div`
  height: 100%;

  [role="application"] {
    height: 100% !important;

    button:disabled {
      pointer-events: none;
    }

    &[aria-disabled="true"] {
      .tox-editor-header {
        position: relative;
        cursor: pointer;

        &::before {
          position: absolute;
          display: flex;
          width: 100%;
          height: calc(100% - 1px);
          background-color: rgba(255, 255, 255, 0.8);
          content: "Click to switch to design mode.";
          place-content: center;
          place-items: center;
          text-shadow: 0 0 25px rgba(0, 0, 0, 0.8);
        }
      }
    }
  }
`;

export default StyledEditor;
