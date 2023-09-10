import { decodeAddress } from '@gear-js/api';
import { useAccount, useAlert, useReadFullState, useSendMessage } from '@gear-js/react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { atom, useAtom } from 'jotai';
import metaMarketNFT from 'assets/market_nft.meta.txt';
import metaMasterNFT from 'assets/master_nft.meta.txt';
import metaNFT from 'assets/nft.meta.txt';
import { sleep, useProgramMetadata } from 'hooks';
import { useSearchParams } from 'react-router-dom';
import { IStorageIdByAddressRequest, IUserNFTRequest } from './types';
import { NFTS_ATOM } from './consts';
import { ADDRESS } from '../../consts';

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

export function useNFTs() {
  const [NFTs, setNFTs] = useAtom(NFTS_ATOM);
  return { nfts: NFTs || [], setNFTs };
}

const TESTNET_NFT_IS_MINTER_ATOM = atom<boolean | undefined>(undefined);

export function useTestnetNFT() {
  const { nfts } = useNFTs();
  const { account } = useAccount();
  const marketMetadata = useProgramMetadata(metaMarketNFT);
  const sendMessage = useSendMessage(ADDRESS.DEFAULT_TESTNET_CONTRACT, marketMetadata, { isMaxGasLimit: true });

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
          // if (!isStateRead) getAllNFTs();
        },
        onError: () => setIsMinting(false),
      },
    );
  };

  return {
    isMinting,
    mintTestnetNFT,
    isTestnetNFTMintAvailable: !!(isMinter && !hasNFT),
  };
}

export function useAutoLogin() {
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

export function useSetup() {
  const { account } = useAccount();
  const masterMetadata = useProgramMetadata(metaMasterNFT);
  const nftMetadata = useProgramMetadata(metaNFT);

  const { setNFTs } = useNFTs();

  // const payloadAdmins = useMemo(() => ({ Admins: null }), []);
  const payloadUserStorageId = useMemo(
    () => (account?.decodedAddress ? { GetStorageIdByAddress: { account_id: account.decodedAddress } } : undefined),
    [account?.decodedAddress],
  );
  const payloadUserNFT = useMemo(
    () => (account?.decodedAddress ? { TokenInfo: { account_id: account.decodedAddress } } : undefined),
    [account?.decodedAddress],
  );

  const { state: resStorageId } = useReadFullState<IStorageIdByAddressRequest>(
    ADDRESS.DEFAULT_TESTNET_CONTRACT,
    masterMetadata,
    payloadUserStorageId,
  );

  const { state: resUserNFT } = useReadFullState<IUserNFTRequest>(
    resStorageId?.StorageIdByAddress,
    nftMetadata,
    payloadUserNFT,
  );

  useEffect(() => {
    setNFTs(resUserNFT?.TokenInfo ? [resUserNFT.TokenInfo] : []);
    console.log({ resStorageId, resUserNFT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resStorageId, resUserNFT]);

  return typeof resUserNFT !== 'undefined';
}
