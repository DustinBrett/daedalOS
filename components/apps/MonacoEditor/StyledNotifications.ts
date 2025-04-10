import styled from "styled-components";

const StyledNotifications = styled.ol`
  bottom: calc(18px + 29px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  place-items: flex-end;
  position: absolute;
  right: 26px;
  width: calc(100% - 80px);

  .notification {
    background: rgb(54 53 55);
    border-radius: 4px;
    box-shadow: 0 0 15px rgb(0 0 0 / 50%);
    color: rgb(186 182 192);
    max-width: 100%;
    padding: 12px 14px 12px 12px;
    width: fit-content;

    &:hover {
      background: rgb(54 53 55);
    }

    figure {
      display: flex;
      place-items: center;

      svg {
        height: 16px;
        width: 16px;

        &.warning {
          color: rgb(253 147 71);
        }

        &.error {
          color: rgb(241 76 76);
        }

        &.info {
          color: rgb(55 148 255);
        }
      }

      figcaption {
        font-size: 14px;
        max-width: calc(100% - 16px);
        overflow: hidden;
        padding-left: 6px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
`;

export default StyledNotifications;
