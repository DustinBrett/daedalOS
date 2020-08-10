import Head from 'next/head';

import State from '../services/state';

export default function MetaData() {
  return (
    <Head>
      <title>{ State.title }</title>
    </Head>
  );
};
