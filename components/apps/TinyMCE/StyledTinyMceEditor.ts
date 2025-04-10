import styled from "styled-components";

const StyledTinyMceEditor = styled.div`
  height: 100%;

  [role="application"] {
    border-radius: 0;
    height: 100% !important;

    button[aria-disabled="true"] {
      pointer-events: none;

      svg {
        fill: rgb(255 255 255 / 50%);
      }
    }

    .tox-statusbar {
      font-size: 12px;
    }

    &[aria-disabled="true"] {
      .tox-editor-header {
        height: 0;
        margin-top: -1px;
        overflow: hidden;
        padding: 0;
        position: relative;
        visibility: hidden;

        &::after {
          bottom: 0;
          color: rgb(200 200 200);
          content: "Edit Document";
          cursor: pointer;
          display: flex;
          font-size: 12px;
          font-weight: 600;
          height: 24px;
          left: 0;
          padding: 0 10px;
          padding-bottom: 2px;
          place-content: center;
          place-items: center;
          position: fixed;
          transform: translateZ(0);
          visibility: visible;
          width: auto;
          z-index: 1;
        }

        &:hover::after {
          background-color: rgb(255 255 255 / 15%);
        }

        .tox-toolbar-overlord {
          display: none;
        }
      }

      /* stylelint-disable selector-class-pattern */
      .tox-statusbar__path-item {
        display: none;
      }
      /* stylelint-enable selector-class-pattern */
    }

    iframe {
      background-color: #202124;
    }
  }
`;

export default StyledTinyMceEditor;
