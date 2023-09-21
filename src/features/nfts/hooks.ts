import { decodeAddress } from '@gear-js/api'
import { useAccount, useSendMessage } from '@gear-js/react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import { socket } from 'utils'
import metaMasterNFT from 'assets/master_nft.meta.txt'
import { useProgramMetadata, useReadStateFromApi } from 'hooks'
import { useSearchParams } from 'react-router-dom'
import { IUserNFTRequest } from './types'
import { NFTS_ATOM } from './consts'
import { ADDRESS } from '../../consts'

const programId = ADDRESS.MASTER_CONTRACT

export function useNFTSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('query') || ''

  const decodedQueryAddress = useMemo(() => {
    if (!searchQuery) return

    try {
      return decodeAddress(searchQuery)
    } catch (error) {
      return undefined
    }
  }, [searchQuery])

  const resetSearchQuery = () => {
    searchParams.delete('query')

    setSearchParams(searchParams)
  }

  return { searchQuery, decodedQueryAddress, resetSearchQuery }
}

export function useNFTs() {
  const [NFTs, setNFTs] = useAtom(NFTS_ATOM)

  const getIpfsAddress = (cid: string) => `${ADDRESS.IPFS_GATEWAY}/${cid}`

  const getImageUrl = (value: string) =>
    value.startsWith('https://') ? value : getIpfsAddress(value)

  return { nfts: NFTs || [], setNFTs, getImageUrl, getIpfsAddress }
}

export function useMintNFT() {
  const { nfts } = useNFTs()
  const { account } = useAccount()

  const masterMetadata = useProgramMetadata(metaMasterNFT)
  const sendMessage = useSendMessage(programId, masterMetadata, {
    isMaxGasLimit: true,
  })

  const [isMinting, setIsMinting] = useState(false)
  const hasNFT = Boolean(
    nfts.find(({ owner }) => owner === account?.decodedAddress)
  )

  const mintNFT = () => {
    setIsMinting(true)
    sendMessage(
      { Mint: null },
      {
        onSuccess: () => {
          socket.emit('state.nft', { address: account?.decodedAddress })
          setIsMinting(false)
        },
        onError: () => setIsMinting(false),
      }
    )
  }

  return {
    mintNFT,
    isMinting,
    isMintingAvailable: !hasNFT,
  }
}

export function useNFTSetup() {
  const { setNFTs } = useNFTs()
  const { state } = useReadStateFromApi<IUserNFTRequest | null>()

  useEffect(() => {
    setNFTs(state ? [state] : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return typeof state !== 'undefined'
}
