import { useState } from 'react';
import { useAccount } from '@gear-js/react-hooks';
import { AccountIcon, Button } from 'components';
import clsx from 'clsx';
import { WalletModal } from '../wallet-modal';
import styles from './Wallet.module.scss';
import { useAccountAvailableBalance } from '../../../available-balance/hooks';

function Wallet({ className }: { className?: string }) {
  const { account, isAccountReady } = useAccount();
  const { isAvailableBalanceReady } = useAccountAvailableBalance();
  const [open, setOpen] = useState(false);

  const openWalletModal = () => setOpen(true);
  const closeWalletModal = () => setOpen(false);

  return (
    <>
      <Button
        variant={account ? 'black' : 'primary'}
        className={clsx(styles.button, className)}
        onClick={openWalletModal}
        disabled={!isAccountReady && !isAvailableBalanceReady}>
        {account && <AccountIcon value={account.address} size={16} className={styles.icon} />}
        <span>{account ? account.meta.name : 'Connect'}</span>
      </Button>

      {open && <WalletModal onClose={closeWalletModal} />}
    </>
  );
}

export { Wallet };
