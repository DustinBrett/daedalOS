import styled from "styled-components";

const StyledProfile = styled.header`
  border-bottom: 1px solid rgb(57, 58, 59);
  color: #fff;
  display: flex;
  font-size: 24px;
  font-weight: 700;
  padding: 8px 15px;
  place-content: space-between;
  place-items: center;
  text-shadow: 1px 1px 1px #000;

  img {
    border: 2px solid #fff;
    border-radius: 50%;
    width: 38px;
  }
`;

export default StyledProfile;
