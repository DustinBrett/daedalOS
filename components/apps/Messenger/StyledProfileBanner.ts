import styled from "styled-components";

const StyledProfileBanner = styled.div`
  background: linear-gradient(hsl(207 100% 72% / 50%), rgb(0 0 0 / 100%));
  border-bottom: 1px solid rgb(57 58 59);
  color: #fff;
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
  text-shadow: 1px 1px 1px #000;

  figure {
    display: flex;
    flex-direction: row-reverse;
    gap: 15px;
    place-items: center;

    svg,
    img {
      aspect-ratio: 1/1;
      border: 2px solid #fff;
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
      background-color: rgb(0 0 0 / 50%);
      border-radius: 5px;
      color: #fff;
      fill: #fff;
      height: 24px;
      outline: 4px solid rgb(0 0 0 / 50%);
      pointer-events: none;
      width: 24px;
    }

    &:hover {
      svg:first-child {
        background-color: rgb(0 0 0 / 75%);
        outline: 4px solid rgb(0 0 0 / 75%);
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
      background-color: rgb(0 0 0 / 50%);
      border-radius: 10px;
      display: flex;
      gap: 3px;
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
