import { useAccount } from '@gear-js/react-hooks';
import { useEffect, useLayoutEffect } from 'react';
import { redirect } from 'react-router-dom';
import { Welcome } from 'features/welcome';

function Home() {
  const { account } = useAccount();
  const accountAddress = account?.decodedAddress;

  useEffect(() => {
    if (accountAddress) redirect('/list');
  }, [accountAddress]);

  useLayoutEffect(() => {
    document.body.classList.add('welcome');

    return () => {
      document.body.classList.remove('welcome');
    };
  }, []);

  return <Welcome />;
}

export { Home };
