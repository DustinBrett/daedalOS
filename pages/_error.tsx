import { type ErrorProps } from "next/error";

const PageError: FC<ErrorProps> = ({ statusCode = 0 }) => (
  <>Error status code: {statusCode}</>
);

export default PageError;
