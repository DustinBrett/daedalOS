import Head from "next/head";
import packageJson from "package.json";

const { description, name } = packageJson;

const Metadata = (): JSX.Element => (
  <Head>
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <meta content={description} name="description" />
    <title>{name}</title>
  </Head>
);

export default Metadata;
