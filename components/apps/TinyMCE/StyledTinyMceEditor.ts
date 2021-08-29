import styled from "styled-components";

const StyledEditor = styled.div`
  height: ${({ theme }) => `calc(100% - ${theme.sizes.taskbar.height})`};

  [role="application"] {
    height: 100% !important;

    button:disabled {
      pointer-events: none;
    }

    &[aria-disabled="true"] {
      .tox-editor-header {
        cursor: not-allowed;
      }
    }
  }
`;

export default StyledEditor;
