import { type ErrorProps } from "next/error";

const PageError = ({ statusCode = 0 }: ErrorProps): React.ReactElement => (
  <>Error status code: {statusCode}</>
);

export default PageError;
