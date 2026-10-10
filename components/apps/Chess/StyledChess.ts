import styled from "styled-components";
import FocusRing from "styles/common/FocusRing";
import VisuallyHidden from "styles/common/VisuallyHidden";

const TOOLBAR_BG = "#262421";
const STATUS_BG = "#1F1D1B";
const TEXT_COLOR = "#F1F1F1";
const SUBTLE_COLOR = "#9D9893";
const ACCENT_COLOR = "#7FA650";
const ACCENT_ACTIVE = "#94BB5C";
const CONTROL_BG = "#3D3A37";
const CONTROL_BORDER = "#454340";
const DISABLED_BG = "#2A2826";
const SELECTION_GREEN = "#9BC700";

const StyledChess = styled.div`
  background-color: #312e2b;
  color: ${TEXT_COLOR};
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.formats.systemFont};
  height: 100%;
  position: relative;
  width: 100%;

  .loading-overlay {
    inset: 0;
    position: absolute;
    z-index: 10;
  }

  nav.toolbar {
    align-items: center;
    background-color: ${TOOLBAR_BG};
    border-bottom: 1px solid ${CONTROL_BORDER};
    display: grid;
    flex: 0 0 auto;
    gap: 8px 10px;
    grid-template-columns: auto 1fr auto 1fr;
    padding: 8px 10px;

    label {
      color: ${SUBTLE_COLOR};
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    select {
      appearance: none;
      background-color: ${CONTROL_BG};
      background-image:
        linear-gradient(45deg, transparent 50%, ${SUBTLE_COLOR} 50%),
        linear-gradient(135deg, ${SUBTLE_COLOR} 50%, transparent 50%);
      background-position:
        calc(100% - 11px) 50%,
        calc(100% - 6px) 50%;
      background-repeat: no-repeat;
      background-size:
        5px 5px,
        5px 5px;
      border: 1px solid ${CONTROL_BORDER};
      border-radius: 3px;
      color: ${TEXT_COLOR};
      font-family: inherit;
      font-size: 12px;
      min-width: 0;
      padding: 4px 22px 4px 6px;
      text-overflow: ellipsis;
      width: 100%;

      &:disabled {
        background-color: ${DISABLED_BG};
        color: ${SUBTLE_COLOR};
      }
    }

    .actions {
      display: flex;
      gap: 6px;
      grid-column: 1 / -1;
    }
  }

  .action-btn {
    background-color: ${ACCENT_COLOR};
    border: 0;
    border-radius: 3px;
    color: #fff;
    cursor: pointer;
    flex: 1;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    padding: 7px 10px;
    text-transform: uppercase;
  }

  .action-btn.secondary {
    background-color: ${CONTROL_BG};
    color: ${TEXT_COLOR};
  }

  .action-btn:disabled {
    cursor: default;
    opacity: 50%;
  }

  .action-btn:hover:not(:disabled) {
    background-color: ${ACCENT_ACTIVE};
  }

  .action-btn.secondary:hover:not(:disabled) {
    background-color: ${CONTROL_BORDER};
  }

  .board-wrap {
    align-items: center;
    container-type: size;
    display: flex;
    flex: 1 1 auto;
    justify-content: center;
    min-height: 0;
    overflow: hidden;
    padding: 10px;
  }

  .board-frame {
    aspect-ratio: 1 / 1;
    border: 2px solid #404040;
    box-sizing: border-box;
    height: min(100cqh, 100cqw);
    position: relative;
    width: min(100cqh, 100cqw);
  }

  .board {
    height: 100%;
    width: 100%;
  }

  /* chessboard2's own border duplicates ours and shifts pieces inward by 2px,
     misaligning our overlay coords/highlight. Drop it. */
  .board .board-container-41a68 {
    border: 0;
  }

  /* Squares are siblings of items-container in chessboard2's DOM, but come
     LATER in source order. With position: relative on .square-4b72b (needed to
     anchor coord pseudo-elements) the squares paint after items-container,
     and their opaque backgrounds hide pieces. Pull items-container above. */
  .board .items-container-c9182 {
    z-index: 1;
  }

  .board .square-4b72b {
    position: relative;
  }

  :root[data-keyboard] & .board:focus .square-4b72b.square-cursor {
    ${FocusRing};
  }

  .cursor-announcement,
  .engine-move {
    ${VisuallyHidden};
  }

  /* Light-green selection overlay on the actual chessboard2 square so
     positioning matches by construction. background-image stacks over the
     existing background-color, letting the square's color show through. */
  .board .square-4b72b.square-selected {
    background-image: linear-gradient(
      ${SELECTION_GREEN}69,
      ${SELECTION_GREEN}69
    );
  }

  /* Edge-only coord labels in the lichess style. Only the corner square
     gets both. content is set per-square below; positioning + color cascade
     from these base rules. */
  .board .square-4b72b::after,
  .board .square-4b72b::before {
    font-size: clamp(8px, 1.6cqmin, 11px);
    font-weight: 700;
    line-height: 1;
    pointer-events: none;
    position: absolute;
    z-index: 2;
  }

  .board .square-4b72b::after {
    bottom: 1px;
    left: 2px;
  }

  .board .square-4b72b::before {
    right: 2px;
    top: 1px;
  }

  .board .square-4b72b.white-3b784::after,
  .board .square-4b72b.white-3b784::before {
    color: #b58863;
  }

  .board .square-4b72b.black-b7cb6::after,
  .board .square-4b72b.black-b7cb6::before {
    color: #f0d9b5;
  }

  ${["a", "b", "c", "d", "e", "f", "g", "h"]
    .map(
      (file) => `
    .board .orientation-white-4de03 [data-square-coord="${file}1"]::after,
    .board .orientation-black-a8276 [data-square-coord="${file}8"]::after {
      content: "${file}";
    }`
    )
    .join("")}

  ${[1, 2, 3, 4, 5, 6, 7, 8]
    .map(
      (rank) => `
    .board .orientation-white-4de03 [data-square-coord="h${rank}"]::before,
    .board .orientation-black-a8276 [data-square-coord="a${rank}"]::before {
      content: "${rank}";
    }`
    )
    .join("")}

  .pgn-nav {
    align-items: center;
    background-color: ${TOOLBAR_BG};
    border-top: 1px solid ${CONTROL_BORDER};
    display: flex;
    flex: 0 0 auto;
    gap: 6px;
    justify-content: center;
    padding: 6px 10px;

    .pgn-counter {
      color: ${SUBTLE_COLOR};
      font-size: 12px;
      font-variant-numeric: tabular-nums;
      min-width: 60px;
      text-align: center;
    }
  }

  .pgn-btn {
    background-color: ${CONTROL_BG};
    border: 1px solid ${CONTROL_BORDER};
    border-radius: 3px;
    color: ${TEXT_COLOR};
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    line-height: 1;
    min-width: 36px;
    padding: 4px 8px;
  }

  .pgn-btn:disabled {
    cursor: default;
    opacity: 50%;
  }

  .pgn-btn:hover:not(:disabled) {
    background-color: ${CONTROL_BORDER};
  }

  .status {
    background-color: ${STATUS_BG};
    border-top: 1px solid ${CONTROL_BORDER};
    color: ${TEXT_COLOR};
    flex: 0 0 auto;
    font-size: 12px;
    padding: 8px 10px;
    text-align: center;

    &.thinking {
      color: ${SUBTLE_COLOR};
      font-style: italic;
    }

    &.over {
      background-color: ${ACCENT_COLOR};
      color: #fff;
      font-weight: 600;
    }
  }
`;

export default StyledChess;
