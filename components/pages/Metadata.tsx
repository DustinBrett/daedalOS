import Head from "next/head";
import packageJson from "package.json";

const { description, name } = packageJson;

const Metadata = (): JSX.Element => (
  <Head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />
    <meta name="description" content={description} />
    <title>{name}</title>
  </Head>
);

export default Metadata;
