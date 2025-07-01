import { type ErrorProps } from "next/error";
import { memo } from "react";

const PageError = ({ statusCode = 0 }: ErrorProps): React.ReactElement => (
  <>Error status code: {statusCode}</>
);

export default memo(PageError);
