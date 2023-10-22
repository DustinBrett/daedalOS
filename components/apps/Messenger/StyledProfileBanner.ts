import styled from "styled-components";

const StyledProfileBanner = styled.div`
  background: linear-gradient(hsla(157, 16%, 58%, 50%), rgba(29, 32, 33, 100%));
  border-bottom: 1px solid rgb(60, 56, 54);
  color: #fbf1c7;
  display: flex;
  font-size: 24px;
  font-weight: 700;
  height: 69px;
  max-height: 69px;
  min-height: 69px;
  padding: 8px 15px;
  place-content: space-between;
  place-items: center;
  position: relative;
  text-shadow: 1px 1px 1px #1d2021;

  figure {
    display: flex;
    flex-direction: row-reverse;
    gap: 15px;
    place-items: center;

    svg,
    img {
      aspect-ratio: 1/1;
      border: 2px solid #fbf1c7;
      border-radius: 50%;
      cursor: pointer;
      height: 38px;
      max-height: 38px;
      max-width: 38px;
      min-height: 38px;
      min-width: 38px;
      width: 38px;

      path {
        cursor: pointer;
      }
    }

    div {
      display: flex;
      place-items: center;

      div.verified {
        svg {
          bottom: -3px;
          left: -5px;
        }
      }
    }
  }

  button:first-child {
    border-radius: 5px;
    cursor: pointer;
    height: 30px;
    padding-top: 3px;
    width: 30px;

    svg:first-child {
      background-color: rgb(29, 32, 33, 50%);
      border-radius: 5px;
      color: #fbf1c7;
      fill: #fbf1c7;
      height: 24px;
      outline: 4px solid rgb(29, 32, 33, 50%);
      pointer-events: none;
      width: 24px;
    }

    &:hover {
      svg:first-child {
        background-color: rgb(29, 32, 33, 75%);
        outline: 4px solid rgb(29, 32, 33, 75%);
      }
    }
  }

  .relays {
    display: flex;
    flex-direction: row;
    left: 0;
    padding-right: 67px;
    place-content: flex-end;
    position: absolute;
    top: 5px;
    width: 100%;

    ol {
      background-color: rgb(29, 32, 33, 50%);
      border-radius: 10px;
      display: flex;
      gap: 2px;
      max-width: calc(100% - 50px);
      overflow: hidden;
      padding: 2px 4px;

      li {
        font-size: 6.5px;
      }
    }
  }
`;

export default StyledProfileBanner;
