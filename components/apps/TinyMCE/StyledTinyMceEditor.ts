import styled from "styled-components";

const StyledTinyMceEditor = styled.div`
  height: 100%;

  [role="application"] {
    border-radius: 0;
    height: 100% !important;

    button:disabled {
      pointer-events: none;
    }

    &[aria-disabled="true"] {
      .tox-editor-header {
        height: 39px;
        overflow: hidden;
        padding: 0;
        position: relative;

        &::before {
          background-color: rgba(42, 43, 46, 90%);
          color: rgb(225, 225, 225);
          content: "Click to switch into design mode";
          cursor: pointer;
          display: flex;
          font-size: 14px;
          font-weight: 600;
          height: calc(100% - 1px);
          place-content: center;
          place-items: center;
          position: absolute;
          text-shadow: 0 0 10px rgba(255, 255, 255, 50%);
          width: 100%;
          z-index: 1;
        }

        .tox-toolbar-overlord {
          display: none;
        }
      }
    }

    iframe {
      background-color: #202124;
    }
  }
`;

export default StyledTinyMceEditor;
