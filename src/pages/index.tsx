import { Route, Routes } from 'react-router-dom'
import { NFTs } from 'features/nfts'
import * as Sentry from '@sentry/react'
import { Home } from './home'
import { NFT } from './nft'
import { NotFound } from './not-found'

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes)

const routes = [
  { path: '/', Page: Home },
  { path: '/:id', Page: NFT },
  { path: '/list', Page: NFTs },
  { path: '*', Page: NotFound },
]

export function Routing() {
  return (
    <SentryRoutes>
      {routes.map(({ path, Page }) => (
        <Route key={path} path={path} element={<Page />} />
      ))}
    </SentryRoutes>
  )
}
