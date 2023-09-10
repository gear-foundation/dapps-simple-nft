import { useAccount, useApi } from '@gear-js/react-hooks';
import { useAuth, useAuthSync, useAutoLogin } from 'features/auth/hooks';
import { ApiLoader, Footer, Header, Loader } from 'components';
import { Routing } from 'pages';
import { withProviders } from 'hocs';
import { useSearchParamsSetup } from 'features/node-switch';
import 'App.scss';
import { useSetup } from './features/nfts';
import { usePendingUI } from './hooks';

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();
  const { isAuthReady } = useAuth();
  // const ref = useRef<null | number>(null);

  useAuthSync();
  useAutoLogin();
  useSearchParamsSetup();

  const setupReady = useSetup();
  const { isPending } = usePendingUI();

  const isEachStateReady = !isPending && setupReady && isAuthReady;
  const isAppReady = isApiReady && isAccountReady;

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
