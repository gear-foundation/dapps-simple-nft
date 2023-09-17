import { FC, PropsWithChildren, SVGProps } from 'react'

export type BaseComponentProps = PropsWithChildren & {
  className?: string
}

export type PickPartial<T, K extends keyof T> = T | Pick<T, K>

// in case Object.entries return value is immutable
// ref: https://stackoverflow.com/a/60142095
export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export type SVGComponent = FC<
  SVGProps<SVGSVGElement> & {
    title?: string | undefined
  }
>

declare global {
  interface Window {
    walletExtension?: { isNovaWallet: boolean }
  }
}
