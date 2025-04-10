import styled from "styled-components";

const StyledChatProfile = styled.li`
  figure {
    display: flex;
    flex-direction: column;
    place-items: center;

    img,
    svg {
      aspect-ratio: 1/1;
      border: 2px solid #fff;
      border-radius: 50%;
      height: 72px;
      margin: 16px 0 8px;
      max-height: 72px;
      max-width: 72px;
      min-height: 72px;
      min-width: 72px;
      width: 72px;
    }

    div.verified {
      svg {
        bottom: -4px !important;
        height: 30px !important;
        left: -6px !important;
        max-height: 30px !important;
        max-width: 30px !important;
        min-height: 30px !important;
        min-width: 30px !important;
        width: 30px !important;
      }
    }

    figcaption {
      color: #fff;
      display: flex;
      flex-direction: column;
      font-size: 17px;
      font-weight: 600;
      padding-bottom: 10px;
      place-items: center;
      text-align: center;

      div.about {
        color: rgb(255 255 255 / 55%);
        font-size: 10px;
        font-weight: 400;
        overflow-wrap: break-word;
        padding-top: 5px;
        width: 60%;
      }

      div.encryption {
        background-color: rgb(255 255 255 / 15%);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        font-size: 12px;
        font-weight: 600;
        gap: 2px;
        margin: 10px;
        padding: 10px 20px;

        span:last-child {
          font-weight: 100;
        }
      }
    }
  }
`;

export default StyledChatProfile;
