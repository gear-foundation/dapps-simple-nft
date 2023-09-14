import { HexString } from '@polkadot/util/types';

export const ADDRESS = {
  DEFAULT_NODE: process.env.REACT_APP_NODE_ADDRESS as string,
  IPFS_GATEWAY: process.env.REACT_APP_IPFS_GATEWAY_ADDRESS as string,
  MASTER_CONTRACT: process.env.REACT_APP_CB_MASTER_NFT_ADDRESS as HexString,
  MASTER_NFT_STATE_API: 'https://state-machine.vara-network.io/state/nft',
};

export const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
  NODE: 'node',
  NODES: 'nodes',
  CONTRACT_ADDRESS: 'simple-nft-contract-address',
};
