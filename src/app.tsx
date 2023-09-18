import 'app.scss'
import { useEffect } from 'react'
import { socket } from 'utils'
import { useAccount } from '@gear-js/react-hooks'
import { Loader } from 'components'
import { Routing } from 'pages'
import { withProviders } from 'hocs'
import { useSetup } from './features/nfts'
import { usePendingUI } from './hooks'
import { useIsAppReady } from './app/hooks/use-is-app-ready'
import { MainLayout } from './components/layout/main-layout'

function Component() {
  const { account } = useAccount()
  const { isAppReady } = useIsAppReady()
  const isSetupReady = useSetup()
  const { isPending } = usePendingUI()

  useEffect(() => {
    if (account?.decodedAddress) {
      socket.emit('state.nft', { address: account?.decodedAddress })
    }
  }, [account])

  const isEachStateReady = !isPending && isSetupReady && isAppReady

  return (
    <MainLayout>
      {isEachStateReady && <Routing />}
      {!isEachStateReady && <Loader />}
    </MainLayout>
  )
}

export const App = withProviders(Component)
