import { useState, useEffect } from 'react'
import { atom, useAtom } from 'jotai'
import { AnyJson } from '@polkadot/types/types'
import { socket } from 'utils'
import { ProgramMetadata } from '@gear-js/api'
import { useAlert } from '@gear-js/react-hooks'

export function useReadStateFromApi<T = AnyJson>() {
  const [data, setData] = useState<T | null>(null)
  const [isStateRead, setIsStateRead] = useState(false)

  useEffect(() => {
    socket.on('state.nft', (res) => {
      setData(res)
      setIsStateRead(true)
    })
  }, [])

  return { state: data || null, isStateRead }
}

// Set value in seconds
export const sleep = (s: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, s * 1000))

const isPendingUI = atom<boolean>(false)

export function usePendingUI() {
  const [isPending, setIsPending] = useAtom(isPendingUI)
  return { isPending, setIsPending }
}

export function useProgramMetadata(source: string) {
  const alert = useAlert()

  const [metadata, setMetadata] = useState<ProgramMetadata>()

  useEffect(() => {
    fetch(source)
      .then((response) => response.text())
      .then((raw) => ProgramMetadata.from(`0x${raw}`))
      .then((result) => setMetadata(result))
      .catch(({ message }: Error) => alert.error(message))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return metadata
}

export const useResizeEffect = (callback: () => void) => {
  useEffect(() => {
    window.addEventListener('resize', callback)

    return () => {
      window.removeEventListener('resize', callback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
