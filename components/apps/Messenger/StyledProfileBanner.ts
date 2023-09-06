import styled from "styled-components";

const StyledProfileBanner = styled.div`
  border-bottom: 1px solid rgb(57, 58, 59);
  color: #fff;
  display: flex;
  font-size: 24px;
  font-weight: 700;
  height: 60px;
  max-height: 60px;
  min-height: 60px;
  padding: 8px 15px;
  place-content: space-between;
  place-items: center;
  text-shadow: 1px 1px 1px #000;

  figure {
    display: flex;
    flex-direction: row-reverse;
    gap: 15px;

    svg,
    img {
      aspect-ratio: 1/1;
      border: 2px solid #fff;
      border-radius: 50%;
      height: 38px;
      max-height: 38px;
      max-width: 38px;
      min-height: 38px;
      min-width: 38px;
      width: 38px;
    }
  }

  button {
    height: 24px;
    width: 24px;

    svg:first-child {
      fill: #fff;
      height: 24px;
      width: 24px;
    }
  }
`;

export default StyledProfileBanner;
