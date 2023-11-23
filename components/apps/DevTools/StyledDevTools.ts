import styled from "styled-components";

const StyledDevTools = styled.div`
  .eruda-container {
    position: relative !important;
    z-index: 1 !important;

    .eruda-dev-tools {
      height: 100% !important;
      opacity: 100% !important;

      .eruda-nav-bar-container {
        .eruda-nav-bar {
          overflow: hidden;
        }
      }
    }

    .eruda-entry-btn {
      display: none;
    }
  }
`;

export default StyledDevTools;
