import Head from "next/head";
import packageJson from "package.json";

const { alias, description, name } = packageJson;

const Metadata = (): JSX.Element => (
  <Head>
    <meta
      content="width=device-width, initial-scale=1, minimum-scale=1"
      name="viewport"
    />
    <meta content={description} name="description" />
    <title>{alias || name}</title>
  </Head>
);

export default Metadata;
