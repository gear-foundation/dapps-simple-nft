import { useAccount } from '@gear-js/react-hooks';
// import { NFTs, TransferNFT as TransferNFTFeature, NFT as NFTFeature } from 'features/nfts';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { ReactComponent as EditSVG } from 'assets/images/icons/edit.svg';
import { ADDRESS } from 'consts';
import { atom } from 'jotai';
import { getLocalStorageMasterId, getSearchParamsMasterId } from '../../../contract-address/utils';
import styles from './TransferNFT.module.scss';
import { TransferNFTModal } from '../transfer-nft-modal';

const CONTRACT_ADDRESS_ATOM = atom(getSearchParamsMasterId() || ADDRESS.DEFAULT_CONTRACT);

function TransferNFT() {

    const [address] = useAtom(CONTRACT_ADDRESS_ATOM);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
  
    return address ? (
      <>
        <button type="button" className={styles.button} onClick={openModal}>
          <span>{address}</span>
          <EditSVG />
        </button>
  
        {isModalOpen && <TransferNFTModal onClose={closeModal} />}
      </>
    ) : null;
}

export { TransferNFT };