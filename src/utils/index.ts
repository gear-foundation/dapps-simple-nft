import { io } from 'socket.io-client';
import { isHex } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import { ADDRESS } from 'consts';

const copyToClipboard = (value: string) => navigator.clipboard.writeText(value).then(() => console.log('Copied!'));

const isProgramIdValid = (value: string): value is HexString => isHex(value, 256);

export const socket = io(ADDRESS.GAME_STATE_SOCKET, {
  transports: ['websocket'],
});

export { copyToClipboard, isProgramIdValid };
