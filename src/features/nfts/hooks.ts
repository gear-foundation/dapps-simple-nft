import { decodeAddress } from '@gear-js/api';
import { useAccount, useReadFullState, useSendMessage } from '@gear-js/react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import metaMasterNFT from 'assets/master_nft.meta.txt';
import metaNFT from 'assets/nft.meta.txt';
import { useProgramMetadata } from 'hooks';
import { useSearchParams } from 'react-router-dom';
import { IStorageIdByAddressRequest, IUserNFTRequest } from './types';
import { NFTS_ATOM } from './consts';
import { ADDRESS } from '../../consts';

const programId = ADDRESS.DEFAULT_TESTNET_CONTRACT;

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

export function useTestnetNFT() {
  const { nfts } = useNFTs();
  const { account } = useAccount();

  const masterMetadata = useProgramMetadata(metaMasterNFT);
  const sendMessage = useSendMessage(programId, masterMetadata, { isMaxGasLimit: true });

  const [isMinting, setIsMinting] = useState(false);
  const hasNFT = Boolean(nfts.find(({ owner }) => owner === account?.decodedAddress));

  const mintNFT = () => {
    setIsMinting(true);
    sendMessage(
      { Mint: null },
      {
        onSuccess: () => setIsMinting(false),
        onError: () => setIsMinting(false),
      },
    );
  };

  return {
    mintNFT,
    isMinting,
    isMintingAvailable: !hasNFT,
  };
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
    programId,
    masterMetadata,
    payloadUserStorageId,
  );

  const { state: resUserNFT } = useReadFullState<IUserNFTRequest>(
    resStorageId?.StorageIdByAddress,
    nftMetadata,
    payloadUserNFT,
  );

  useEffect(() => {
    setNFTs(
      resStorageId && resUserNFT?.TokenInfo
        ? [
            {
              ...resUserNFT.TokenInfo,
              programId: resStorageId.StorageIdByAddress,
              id: resUserNFT.TokenInfo.owner,
            },
          ]
        : [],
    );
    console.log({ resStorageId, resUserNFT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resStorageId, resUserNFT]);

  return typeof resUserNFT !== 'undefined';
}
