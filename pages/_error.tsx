import type { ErrorProps } from "next/error";

const Error = ({ statusCode = 0 }: ErrorProps): React.ReactElement => (
  <>Error status code: {statusCode}</>
);

export default Error;
