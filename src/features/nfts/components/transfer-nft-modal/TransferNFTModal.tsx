import React, { useState, useMemo, ChangeEvent } from 'react';
import { createSearchParams, useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useAccount, useSendMessage} from '@gear-js/react-hooks';
import { useForm } from '@mantine/form';
import { Button, Input } from '@gear-js/ui'
import { useNFTs } from 'features/nfts/hooks';
import { HexString } from '@polkadot/util/types';
import { getProgramMetadata } from '@gear-js/api';
import { isProgramIdValid } from 'utils';
import { Modal } from 'components';
import { ADDRESS } from 'consts';
import { TESTNET_NFT_CONTRACT_ADDRESS } from '../../consts';
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
  const [nftFormForTrans, setNftFormForTrans] = useState(initialValues);

  // const handleInputChange = (e: {target: {name: any, value: any }}) => {
  //   const { name, value } = e.target;
  //   setNftFormForTrans({...nftFormForTrans, [name]: value})
  // }
  const { account } = useAccount();
  // const { decodedAddress } = account || {};

  const resetForm = () => {
    setNftFormForTrans(initialValues)
  }
  const {NFTContracts} = useNFTs();
  const { programId, id } = useParams() as Params;

  const contract = NFTContracts.find(([address]) => address === programId);
  const metaRaw = contract?.[1];
  const metaHex = metaRaw ? (`0x${metaRaw}` as HexString) : undefined;
  const metadata = useMemo(() => (metaHex ? getProgramMetadata(metaHex) : undefined), [metaHex]);


  const { getInputProps, onSubmit, setFieldError, errors } = useForm({ initialValues });
  const error = errors.address;
  const sendMessage = useSendMessage(programId, metadata);

  const handleTransfer = onSubmit(async ({ to_address }) => {
    // if (!isProgramIdValid(to_address)) return setFieldError('address', 'Address should be hex (256 bits)');
    console.debug('Debug message');
    const payload = {
      Transfer: {
          from: account?.decodedAddress,
          to: to_address,
          token_id: id,
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

  // return (
  //   <>
  //       <h2 className={styles.heading}> Transfer NFT</h2>
  //       <div className={styles.main}>
  //         <form className={styles.from} onSubmit={TransferNFT}>
  //           <div className={styles.item}>
  //               {/* <Input label="To_address" className={styles.input} required name="to_address" value={to_address} onChange={handleInputChange}/> */}
  //               <Input label="To_address" className={styles.input} required/>
  //           </div>
  //           <Button type="submit" text="Transfer" className={styles.button}/>
  //         </form>
  //       </div>
  //   </>
  // );
}

