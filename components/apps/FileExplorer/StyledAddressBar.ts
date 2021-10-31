import styled from "styled-components";

type StyledAddressBarProps = {
  icon: string;
};

const StyledAddressBar = styled.input.attrs({
  type: "text",
})<StyledAddressBarProps>`
  background-color: rgb(25, 25, 25);
  background-image: ${({ icon }) =>
    `url('${icon.replace("/Icons/", "/Icons/16x16/")}')`};
  background-position: 2px 5px;
  background-repeat: no-repeat;
  border: 1px solid rgb(83, 83, 83);
  color: #fff;
  font-family: ${({ theme }) => theme.formats.systemFont};
  font-size: 12px;
  font-weight: 400;
  height: 30px;
  margin: 6px 12px 6px 5px;
  padding: 0 22px 2px 24px;
  text-overflow: ellipsis;
  width: 100%;
`;

export default StyledAddressBar;
