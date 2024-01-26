import styled from "styled-components";

const StyledNotifications = styled.ol`
  position: absolute;
  bottom: calc(18px + 29px);
  right: 26px;
  display: flex;
  width: calc(100% - 80px);
  flex-direction: column;
  gap: 12px;
  place-items: flex-end;

  .notification {
    background: rgb(54, 53, 55);
    border-radius: 4px;
    color: rgb(186, 182, 192);
    padding: 12px 14px 12px 12px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
    max-width: 100%;
    width: fit-content;

    &:hover {
      background: rgb(54, 53, 55);
    }

    figure {
      display: flex;
      place-items: center;

      svg {
        height: 16px;
        width: 16px;

        &.warning {
          color: rgb(253, 147, 71);
        }

        &.error {
          color: rgb(241, 76, 76);
        }

        &.info {
          color: rgb(55, 148, 255);
        }
      }

      figcaption {
        font-size: 14px;
        padding-left: 6px;
        max-width: calc(100% - 16px);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
`;

export default StyledNotifications;
