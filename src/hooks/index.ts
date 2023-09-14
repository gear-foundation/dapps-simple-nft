import { MessagesDispatched, ProgramMetadata, StateMetadata, getStateMetadata } from '@gear-js/api';
import { useAccount, useAlert, useApi, useReadFullState } from '@gear-js/react-hooks';
import { HexString } from '@polkadot/util/types';
import { useState, useEffect, useRef } from 'react';
import { atom, useAtom } from 'jotai';
import { AnyJson } from '@polkadot/types/types';
import { ADDRESS } from 'consts';

const isPendingUI = atom<boolean>(false);

const postState = async (body: AnyJson) =>
  fetch(`${ADDRESS.MASTER_NFT_STATE_API}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  });

export function useReadStateFromApi<T = AnyJson>(
  programId: HexString | undefined,
  meta: ProgramMetadata | undefined,
  payload: AnyJson = '0x',
  isReadOnError?: boolean,
) {
  const { api } = useApi();
  const alert = useAlert();
  const { account } = useAccount();

  const [state, setState] = useState<T>();
  const [isStateRead, setIsStateRead] = useState(true);
  const [error, setError] = useState('');

  const isPayload = payload !== undefined;

  const readStateFromApi = async (isInitLoad?: boolean) => {
    if (!account) return;

    if (isInitLoad) setIsStateRead(false);

    try {
      const res = await postState({
        address: account?.decodedAddress,
      });

      const data = await res.json();

      setState(data as T);
      if (!isReadOnError) setIsStateRead(true);
    } catch ({ message }: any) {
      setError(message as any);
    } finally {
      if (isReadOnError) setIsStateRead(true);
    }
  };

  const handleStateChange = async ({ data }: MessagesDispatched) => {
    const changedIDs = data.stateChanges.toHuman() as HexString[];
    const isAnyChange = changedIDs.some((id) => id === programId);

    if (isAnyChange) {
      readStateFromApi();
    }
  };

  useEffect(() => {
    if (!api || !programId || !meta || !isPayload) return;

    const unsub = api.gearEvents.subscribeToGearEvent('MessagesDispatched', handleStateChange);

    return () => {
      unsub.then((unsubCallback) => unsubCallback());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, programId, meta, payload, account]);

  useEffect(() => {
    readStateFromApi(true);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, programId, meta, payload, account]);

  useEffect(() => {
    if (error) alert.error(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return { state, isStateRead, error };
}
// Set value in seconds
export const sleep = (s: number) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, s * 1000));

export function usePendingUI() {
  const [isPending, setIsPending] = useAtom(isPendingUI);
  return { isPending, setIsPending };
}

function useProgramMetadata(source: string) {
  const alert = useAlert();

  const [metadata, setMetadata] = useState<ProgramMetadata>();

  useEffect(() => {
    fetch(source)
      .then((response) => response.text())
      .then((raw) => ProgramMetadata.from(`0x${raw}`))
      .then((result) => setMetadata(result))
      .catch(({ message }: Error) => alert.error(message));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return metadata;
}

export function useStateMetadata(source: string) {
  const alert = useAlert();

  const [data, setData] = useState<{
    buffer: Buffer;
    meta: StateMetadata;
  }>();

  useEffect(() => {
    fetch(source)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => Buffer.from(arrayBuffer))
      .then(async (buffer) => ({
        buffer,
        meta: await getStateMetadata(buffer),
      }))
      .then((result) => setData(result))
      .catch(({ message }: Error) => alert.error(message));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}

export function useReadState<T>({ programId, meta }: { programId?: HexString; meta: string }) {
  const metadata = useProgramMetadata(meta);
  return useReadFullState<T>(programId, metadata, '0x');
}

const useOutsideClick = <TElement extends Element>(callback: (event: MouseEvent) => void) => {
  const ref = useRef<TElement>(null);

  const handleClick = (event: MouseEvent) => {
    const isOutsideClick = ref.current && !ref.current.contains(event.target as Node);

    if (isOutsideClick) callback(event);
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => document.removeEventListener('click', handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
};

const useResizeEffect = (callback: () => void) => {
  useEffect(() => {
    window.addEventListener('resize', callback);

    return () => {
      window.removeEventListener('resize', callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export { useProgramMetadata, useOutsideClick, useResizeEffect };
