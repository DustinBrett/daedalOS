import { useFileSystem } from "contexts/fileSystem";
import { useEffect, useRef } from "react";
import styled from "styled-components";

const StyledFileInput = styled.input.attrs({
  multiple: true,
  type: "file",
})`
  display: none;
`;

const FileInput = (): JSX.Element => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { setFileInput } = useFileSystem();

  useEffect(() => {
    if (inputRef.current) setFileInput(inputRef.current);
  }, [setFileInput]);

  return <StyledFileInput ref={inputRef} />;
};

export default FileInput;
