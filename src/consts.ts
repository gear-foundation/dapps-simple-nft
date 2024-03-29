import { HexString } from '@polkadot/util/types';

const ADDRESS = {
  DETAULT_NODE: process.env.REACT_APP_NODE_ADDRESS as string,
  DEFAULT_NODES: process.env.REACT_APP_DEFAULT_NODES_URL as string,
  DEFAULT_CONTRACT: process.env.REACT_APP_DEFAULT_CONTRACT_ADDRESS as HexString,
  DEFAULT_TESTNET_CONTRACT: process.env.REACT_APP_DEFAULT_TESTNET_CONTRACT_ADDRESS as HexString,
  IPFS_GATEWAY: process.env.REACT_APP_IPFS_GATEWAY_ADDRESS as string,
  TESTNET_IPFS_GATEWAY: process.env.REACT_APP_TESTNET_IPFS_GATEWAY_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
  NODE: 'node',
  NODES: 'nodes',
  CONTRACT_ADDRESS: 'simple-nft-contract-address',
};

const SEARCH_PARAMS = {
  MASTER_CONTRACT_ID: 'master',
};

export { ADDRESS, LOCAL_STORAGE, SEARCH_PARAMS };
