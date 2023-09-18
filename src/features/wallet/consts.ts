import { EnkryptSVG, NovaIcon, PolkadotSVG, SubWalletSVG, TalismanSVG } from './assets'
// eslint-disable-next-line import/no-cycle
import type { IWalletExtensionContent, IWalletId } from './types'

export const WALLET_ID_LOCAL_STORAGE_KEY = 'wallet'

export const isNovaWallet = !!window?.walletExtension?.isNovaWallet

export const WALLET = isNovaWallet
  ? {
      'polkadot-js': { name: 'Nova Wallet', SVG: NovaIcon },
    }
  : {
      'polkadot-js': { name: 'Polkadot JS', SVG: PolkadotSVG },
      'subwallet-js': { name: 'SubWallet', SVG: SubWalletSVG },
      talisman: { name: 'Talisman', SVG: TalismanSVG },
      enkrypt: { name: 'Enkrypt', SVG: EnkryptSVG },
    }

export const WALLETS = Object.entries(WALLET) as [IWalletId, IWalletExtensionContent][]
