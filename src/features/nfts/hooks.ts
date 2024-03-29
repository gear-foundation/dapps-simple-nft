import { MessagesDispatched, ProgramMetadata, decodeAddress, getStateMetadata } from '@gear-js/api';
import { useAccount, useAlert, useApi, useSendMessage } from '@gear-js/react-hooks';
import { HexString } from '@polkadot/util/types';
import { UnsubscribePromise } from '@polkadot/api/types';
import { useEffect, useMemo, useState } from 'react';
import { atom, useAtom } from 'jotai';
import metaMarketNFT from 'assets/market_nft.meta.txt';
import metaMasterNFT from 'assets/master_nft.meta.txt';
import metaWasmMasterNFT from 'assets/master_nft.meta.wasm';
import metaNFT from 'assets/nft.meta.txt';
import { sleep, useProgramMetadata, useStateMetadata } from 'hooks';
import { useLocation, useSearchParams } from 'react-router-dom';
import { isHex } from '@polkadot/util';
import { useContractAddress } from '../contract-address';
import { MasterContractState, NFTContractState } from './types';
import { NFTS_ATOM, NFT_CONTRACTS_ATOM, TESTNET_NFT_CONTRACT_ADDRESS } from './consts';
import { ADDRESS } from '../../consts';
import { useNodeAddress } from '../node-switch';

const handleStateChange = ({ data }: MessagesDispatched, programId: HexString, onChange: () => void) => {
  const changedIDs = data.stateChanges.toHuman() as HexString[];
  const isAnyChange = changedIDs.some((id) => id === programId);

  if (isAnyChange) onChange();
};

export function useNFTSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') || '';

  const decodedQueryAddress = useMemo(() => {
    if (!searchQuery) return;

    try {
      return decodeAddress(searchQuery);
    } catch (error) {
      return undefined;
    }
  }, [searchQuery]);

  const resetSearchQuery = () => {
    searchParams.delete('query');

    setSearchParams(searchParams);
  };

  return { searchQuery, decodedQueryAddress, resetSearchQuery };
}

export function useGetAllNFTs() {
  const { api } = useApi();
  const alert = useAlert();

  const [NFTContracts] = useAtom(NFT_CONTRACTS_ATOM);
  const [, setNFTs] = useAtom(NFTS_ATOM);
  const [isStateRead, setIsStateRead] = useState<boolean>(false);

  const getAllNFTs = (cb?: () => void) => {
    if (!NFTContracts) return;

    const promises = NFTContracts.map(([programId, metaRaw], index) => {
      const metadata = ProgramMetadata.from(`0x${metaRaw}`);

      return api.programState
        .read({ programId, payload: '0x' }, metadata)
        .then((codec) => codec.toHuman() as NFTContractState)
        .then(({ tokens, collection }) =>
          tokens.map(([id, token]) => ({ ...token, id, programId, collection: collection.name })),
        );
    });

    Promise.all(promises)
      .then((result) => {
        setIsStateRead(true);
        setNFTs(result.flat());
      })
      .catch(({ message }: Error) => alert.error(message))
      .finally(() => cb && cb());
  };

  return { getAllNFTs, isStateRead };
}

export function useGetTestnetUserNFTs() {
  const { api } = useApi();
  const { account } = useAccount();
  const alert = useAlert();
  const { getAllNFTs } = useGetAllNFTs();
  const { searchQuery } = useNFTSearch();
  const metawasm = useStateMetadata(metaWasmMasterNFT);
  const masterMetadata = useProgramMetadata(metaMasterNFT);
  const nftMetadata = useProgramMetadata(metaNFT);

  const { pathname } = useLocation();

  const [, setNFTs] = useAtom(NFTS_ATOM);
  const [NFTContracts] = useAtom(NFT_CONTRACTS_ATOM);

  const getTestnetNFTs = () => {
    if (!NFTContracts || !metawasm?.buffer || !masterMetadata || !nftMetadata) return;

    const getUserNFT = (programId: HexString, meta: string | undefined) => {
      api.programState
        .read({ programId, payload: '0x' }, meta ? ProgramMetadata.from(`0x${meta}`) : nftMetadata)
        .then((codec) => codec.toHuman() as NFTContractState)
        .then(({ tokens, collection }) =>
          tokens.map(([id, token]) => ({ ...token, id, programId, collection: collection.name })),
        )
        .then((result) => setNFTs(result.flat()))
        .catch(({ message }: Error) => alert.error(message));
    };

    getStateMetadata(metawasm?.buffer)
      .then((stateMetadata) =>
        api.programState.readUsingWasm(
          {
            programId: TESTNET_NFT_CONTRACT_ADDRESS,
            wasm: metawasm?.buffer,
            fn_name: 'get_storage_id',
            argument: account?.decodedAddress,
            payload: '0x',
          },
          stateMetadata,
          masterMetadata,
        ),
      )
      .then((raw) => {
        const storageId = raw.toHuman() as HexString;
        const storageIdFallback = NFTContracts.find(([address]) => storageId === address);
        const userStorage = storageIdFallback || storageId;

        if (userStorage && !searchQuery) {
          const nftStorageId = pathname.slice(1, pathname.indexOf('/', 1));
          const isViewingNFT = isHex(nftStorageId);
          const getUserStorageData = (storageData: [HexString, string] | HexString) => {
            if (Array.isArray(storageData)) {
              const [programId, meta] = storageData;
              return { programId, meta };
            }
            return { programId: userStorage as HexString, meta: undefined };
          };
          const { programId, meta } = getUserStorageData(userStorage);
          if (isViewingNFT) {
            if (nftStorageId === programId) getUserNFT(programId, meta);
            else getAllNFTs();
          } else getUserNFT(programId, meta);
        } else getAllNFTs();
      })
      .catch(({ message }: Error) => alert.error(message));
  };

  return { getTestnetNFTs };
}

export function useNFTsState() {
  const { api, isApiReady } = useApi();
  const { account, isAccountReady } = useAccount();
  const alert = useAlert();
  const { contractAddress: masterContractAddress } = useContractAddress();
  const masterMetadata = useProgramMetadata(metaMasterNFT);
  const { isTestnet } = useNodeAddress();

  const [NFTContracts, setNFTContracts] = useAtom(NFT_CONTRACTS_ATOM);
  const [NFTs] = useAtom(NFTS_ATOM);

  const { getAllNFTs } = useGetAllNFTs();
  const { getTestnetNFTs } = useGetTestnetUserNFTs();

  const readMasterContractState = () => {
    if (!isApiReady || !masterContractAddress || !masterMetadata) return;

    const programId = masterContractAddress;

    api.programState
      .read({ programId, payload: `0x` }, masterMetadata)
      .then((codec) => codec.toHuman() as MasterContractState)
      .then(({ nfts }) => setNFTContracts(nfts))
      .catch(({ message }: Error) => alert.error(message));
  };

  useEffect(() => {
    setNFTContracts(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterContractAddress]);

  useEffect(() => {
    if (!isApiReady || !isAccountReady || !masterContractAddress || !masterMetadata) return;

    readMasterContractState();

    const unsub = api.gearEvents.subscribeToGearEvent('MessagesDispatched', (event) =>
      handleStateChange(event, masterContractAddress, readMasterContractState),
    );

    return () => {
      unsub.then((unsubCallback) => unsubCallback());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiReady, isAccountReady, masterContractAddress, masterMetadata]);

  const readNFTContractsStates = () => {
    if (!NFTContracts) return;
    if (isTestnet) {
      // is user is logged in, read only his nft storage state
      if (account) getTestnetNFTs();
      else getAllNFTs();
    } else getAllNFTs();
  };

  useEffect(() => {
    if (!NFTContracts) return;

    readNFTContractsStates();

    const unsubs: UnsubscribePromise[] = [];

    // TODO: if state of any contract changes,
    // we reread every single one specified in master contract.
    // need to find the way to optimize
    NFTContracts.forEach(([programId]) => {
      const unsub = api.gearEvents.subscribeToGearEvent('MessagesDispatched', (event) =>
        handleStateChange(event, programId, readNFTContractsStates),
      );

      unsubs.push(unsub);
    });

    return () => {
      unsubs.map((unsub) => unsub.then((unsubCallback) => unsubCallback()));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NFTContracts, account?.decodedAddress]);

  return masterContractAddress ? !!NFTs : true;
}

export function useNFTs() {
  const [NFTs] = useAtom(NFTS_ATOM);
  const [NFTContracts] = useAtom(NFT_CONTRACTS_ATOM);

  return { nfts: NFTs || [], NFTContracts: NFTContracts || [] };
}

const TESTNET_NFT_IS_MINTER_ATOM = atom<boolean | undefined>(undefined);

export function useTestnetNFTSetup() {
  const { api, isApiReady } = useApi();
  const { account } = useAccount();
  const alert = useAlert();
  const { isTestnet } = useNodeAddress();

  const metawasm = useStateMetadata(metaWasmMasterNFT);
  const masterMetadata = useProgramMetadata(metaMasterNFT);

  const [isMinter, setIsMinter] = useAtom(TESTNET_NFT_IS_MINTER_ATOM);

  const readState = () => {
    if (!api || !metawasm || !masterMetadata) return;

    getStateMetadata(metawasm?.buffer)
      .then((stateMetadata) =>
        api.programState.readUsingWasm(
          {
            programId: TESTNET_NFT_CONTRACT_ADDRESS,
            wasm: metawasm?.buffer,
            fn_name: 'in_minter_list',
            argument: account?.decodedAddress,
          },
          stateMetadata,
          masterMetadata,
        ),
      )
      .then((result) => setIsMinter(result.toHuman() as boolean))
      .catch(({ message }: Error) => alert.error(message));
  };

  useEffect(() => {
    if (!isTestnet || !isApiReady || !metawasm) return;

    readState();

    const unsub = api.gearEvents.subscribeToGearEvent('MessagesDispatched', (event) =>
      handleStateChange(event, ADDRESS.DEFAULT_TESTNET_CONTRACT, readState),
    );

    return () => {
      unsub.then((unsubCallback) => unsubCallback());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiReady, account?.decodedAddress, isTestnet]);

  return isTestnet ? typeof isMinter !== 'undefined' : true;
}

export function useTestnetNFT() {
  const { nfts } = useNFTs();
  const { account } = useAccount();
  const marketMetadata = useProgramMetadata(metaMarketNFT);
  const sendMessage = useSendMessage(TESTNET_NFT_CONTRACT_ADDRESS, marketMetadata, { isMaxGasLimit: true });
  const { getAllNFTs, isStateRead } = useGetAllNFTs();
  const { isTestnet } = useNodeAddress();

  const [isMinter] = useAtom(TESTNET_NFT_IS_MINTER_ATOM);
  const [isMinting, setIsMinting] = useState(false);
  const hasNFT = Boolean(nfts.find(({ owner }) => owner === account?.decodedAddress));

  const mintTestnetNFT = () => {
    setIsMinting(true);
    sendMessage(
      { Mint: null },
      {
        onSuccess: async () => {
          await sleep(0.5);
          setIsMinting(false);
          if (!isStateRead) getAllNFTs();
        },
        onError: () => setIsMinting(false),
      },
    );
  };

  return {
    isMinting,
    mintTestnetNFT,
    isTestnetNFTMintAvailable: isTestnet ? !!(isMinter && !hasNFT) : false,
  };
}

export function useTestnetAutoLogin() {
  const { login, accounts, isAccountReady } = useAccount();
  const alert = useAlert();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!isAccountReady) return;

    const accountAddress = searchParams.get('account');

    if (accountAddress) {
      const account = accounts.find(({ address }) => address === accountAddress);

      if (account) {
        login(account).then(() => {
          searchParams.delete('account');
          setSearchParams(searchParams);
        });
      } else {
        alert.error(`Account with address ${accountAddress} not found`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, accounts, isAccountReady]);
}
