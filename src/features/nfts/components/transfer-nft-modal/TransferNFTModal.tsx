import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSendMessage} from '@gear-js/react-hooks';
import { useForm } from '@mantine/form';
import { useNFTs } from 'features/nfts/hooks';
import { HexString } from '@polkadot/util/types';
import { getProgramMetadata } from '@gear-js/api';
import { Modal } from 'components';
import styles from './TransferNFTModal.module.scss'

const initialValues = { to_address: '' };
type Params = {
  programId: HexString;
  id: string;
};

type Props = {
  onClose: () => void;
};

export function TransferNFTModal({ onClose }: Props) {
  const [, setNftFormForTrans] = useState(initialValues);

  const resetForm = () => {
    setNftFormForTrans(initialValues)
  }
  const {NFTContracts} = useNFTs();
  const { programId, id } = useParams() as Params;
  const contract = NFTContracts.find(([address]) => address === programId);
  const metaRaw = contract?.[1];
  const metaHex = metaRaw ? (`0x${metaRaw}` as HexString) : undefined;
  const metadata = useMemo(() => (metaHex ? getProgramMetadata(metaHex) : undefined), [metaHex]);

  const { getInputProps, onSubmit, errors } = useForm({ initialValues });
  const error = errors.address;
  const sendMessage = useSendMessage(programId, metadata);

  const handleTransfer = onSubmit(async ({ to_address }) => {
    // TODO: check the address for validity
    const payload = {
      Transfer: {
          to: to_address,
          nft_id: id,
      }
    };
    sendMessage(payload, { onSuccess: resetForm });
    onClose();
  });

  return (
    <Modal heading="Transfer NFT" onClose={onClose}>
      <form className={styles.form} onSubmit={handleTransfer}>
        <div>
          
          <span>To address</span>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <input placeholder="0x01" {...getInputProps('to_address')} className={styles.input} />
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <button type="submit" className={styles.button}>
          Transfer
        </button>
      </form>
    </Modal>
  );
}

