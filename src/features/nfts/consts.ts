import { atom } from 'jotai'
import { NFT } from './types'

const NFTS_ATOM = atom<NFT[] | null>(null)

export { NFTS_ATOM }
