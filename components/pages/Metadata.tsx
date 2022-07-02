import Head from "next/head";
import { PACKAGE_DATA } from "utils/constants";

const { alias, description } = PACKAGE_DATA;

const Metadata: FC = () => (
  <Head>
    <meta
      content="width=device-width, initial-scale=1, minimum-scale=1"
      name="viewport"
    />
    <meta content={description} name="description" />
    <title>{alias}</title>
  </Head>
);

export default Metadata;
