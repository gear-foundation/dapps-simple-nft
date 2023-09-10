import 'app.scss';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { useAuth, useAuthSync, useAutoLogin } from 'features/auth/hooks';
import { ApiLoader, Footer, Header, Loader } from 'components';
import { Routing } from 'pages';
import { withProviders } from 'hocs';
import { useAccountAvailableBalance, useAccountAvailableBalanceSync } from 'features/available-balance/hooks';
import { useEffect } from 'react';
import { useSetup } from './features/nfts';
import { usePendingUI } from './hooks';

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();
  const { isAuthReady } = useAuth();
  // const ref = useRef<null | number>(null);

  useAuthSync();
  useAutoLogin();
  useAccountAvailableBalanceSync();

  const isSetupReady = useSetup();
  const { isPending } = usePendingUI();
  const { isAvailableBalanceReady } = useAccountAvailableBalance();

  const isEachStateReady = !isPending && isSetupReady && isAuthReady && isAvailableBalanceReady;
  const isAppReady = isApiReady && isAccountReady;

  useEffect(() => {
    console.log({
      isPending,
      isSetupReady,
      isAuthReady,
      isAvailableBalanceReady,
    });
  }, [isAuthReady, isAvailableBalanceReady, isPending, isSetupReady]);

  // useEffect(() => {
  //   if (!ref.current) ref.current = performance.now();
  //
  //   if (isNFTStateReady && ref.current) {
  //     const diff = Math.floor((performance.now() - ref.current) * 1000) / 1_000_000;
  //     console.log(`${diff} seconds`);
  //     ref.current = null;
  //   }
  // }, [isNFTStateReady, isTestnetStateReady]);

  return (
    <>
      <Header />
      <main>
        {isAppReady ? (
          <>
            {isEachStateReady && <Routing />}
            {!isEachStateReady && <Loader />}
          </>
        ) : (
          <ApiLoader />
        )}
      </main>
      <Footer />
    </>
  );
}

export const App = withProviders(Component);
