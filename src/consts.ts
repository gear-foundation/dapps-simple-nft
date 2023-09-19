import { HexString } from '@polkadot/util/types'

export const ADDRESS = {
  DEFAULT_NODE: process.env.REACT_APP_NODE_ADDRESS as string,
  IPFS_GATEWAY: process.env.REACT_APP_IPFS_GATEWAY_ADDRESS as string,
  MASTER_CONTRACT: process.env.REACT_APP_CB_MASTER_NFT_ADDRESS as HexString,
  GAME_STATE_SOCKET: 'wss://state-machine.vara-network.io',
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
}
