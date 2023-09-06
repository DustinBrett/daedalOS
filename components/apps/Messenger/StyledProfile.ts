import styled from "styled-components";

const StyledProfile = styled.div`
  border-bottom: 1px solid rgb(57, 58, 59);
  color: #fff;
  display: flex;
  font-size: 24px;
  font-weight: 700;
  padding: 8px 15px;
  place-content: space-between;
  place-items: center;
  text-shadow: 1px 1px 1px #000;

  button {
    height: 24px;
    width: 24px;

    svg {
      fill: #fff;
      height: inherit;
      width: inherit;
    }
  }

  figure {
    display: flex;
    flex-direction: row-reverse;
    gap: 15px;
  }

  img {
    border: 2px solid #fff;
    border-radius: 50%;
    width: 38px;
  }
`;

export default StyledProfile;
