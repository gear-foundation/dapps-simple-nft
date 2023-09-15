import { decodeAddress } from '@gear-js/api';
import { useAccount, useReadFullState, useSendMessage } from '@gear-js/react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import metaMasterNFT from 'assets/master_nft.meta.txt';
import metaNFT from 'assets/nft.meta.txt';
import { usePendingUI, useProgramMetadata, useReadStateFromApi } from 'hooks';
import { useSearchParams } from 'react-router-dom';
import { isHex } from '@polkadot/util';
import { IStorageIdByAddressRequest, IUserNFTRequest } from './types';
import { NFTS_ATOM } from './consts';
import { ADDRESS } from '../../consts';

const programId = ADDRESS.MASTER_CONTRACT;

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

  const getIpfsAddress = (cid: string) => `${ADDRESS.IPFS_GATEWAY}/${cid}`;

  const getImageUrl = (value: string) => (value.startsWith('https://') ? value : getIpfsAddress(value));

  return { nfts: NFTs || [], setNFTs, getImageUrl, getIpfsAddress };
}

export function useMintNFT() {
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
  const { searchQuery } = useNFTSearch();
  const { setIsPending } = usePendingUI();

  // const payloadAdmins = useMemo(() => ({ Admins: null }), []);
  const payloadUserStorageId = useMemo(() => {
    if (searchQuery && isHex(searchQuery)) {
      return { GetStorageIdByAddress: { account_id: searchQuery } };
    }

    return account?.decodedAddress ? { GetStorageIdByAddress: { account_id: account.decodedAddress } } : undefined;
  }, [account?.decodedAddress, searchQuery]);

  const { state: resStorageId, isStateRead } = useReadFullState<IStorageIdByAddressRequest>(
    programId,
    masterMetadata,
    payloadUserStorageId,
  );

  const { state: resUserNFT } = useReadStateFromApi<IUserNFTRequest>();

  useEffect(() => {
    setNFTs(
      resStorageId && resUserNFT
        ? ([
            {
              ...resUserNFT,
              programId: resStorageId.StorageIdByAddress,
              id: resUserNFT.owner,
            },
          ] as any)
        : [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resStorageId, resUserNFT]);

  return account ? typeof resUserNFT !== 'undefined' : typeof resStorageId !== 'undefined';
}
