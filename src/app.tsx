import 'app.scss'
import { useEffect } from 'react'
import { socket } from 'utils'
import { useAccount } from '@gear-js/react-hooks'
import { Loader } from 'components'
import { Routing } from 'pages'
import { withProviders } from 'hocs'
import { useNFTSetup } from './features/nfts'
import { usePendingUI } from './hooks'
import { useIsAppReady } from './app/hooks/use-is-app-ready'
import { MainLayout } from './components/layout/main-layout'

function Component() {
  const { account } = useAccount()
  const { isAppReady } = useIsAppReady()
  const isNFTReady = useNFTSetup()
  const { isPending } = usePendingUI()

  useEffect(() => {
    if (!account?.decodedAddress) return
    socket.emit('state.nft', { address: account?.decodedAddress })

    socket.on('nft_changed', () => {
      socket.emit('state.nft', { address: account?.decodedAddress })
    })
  }, [account?.decodedAddress])

  const isEachStateReady = !isPending && isNFTReady && isAppReady

  return (
    <MainLayout>
      {isEachStateReady && <Routing />}
      {!isEachStateReady && <Loader />}
    </MainLayout>
  )
}

export const App = withProviders(Component)
