import { useState } from 'react';
import { Wallet } from 'features/wallet';
import { Search } from 'features/nfts';
import { useResizeEffect } from 'hooks';
import { Button } from 'components';
import { CrossIcon, HamburgerIcon } from 'assets/images';
import clsx from 'clsx';
import { useAccount } from '@gear-js/react-hooks';
import { Container } from '../container';
import { Logo } from './logo';
import styles from './Header.module.scss';
import { AccountBalance } from '../../ui/balance/Balance';
import { useAccountAvailableBalance } from '../../../features/available-balance/hooks';

function Header() {
  const { account, isAccountReady } = useAccount();
  const { isAvailableBalanceReady } = useAccountAvailableBalance();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prevValue) => !prevValue);
  const closeMenu = () => setIsMenuOpen(false);

  useResizeEffect(closeMenu);

  return (
    <header>
      <Container className={styles.container}>
        <Logo />

        <div className={styles.mobileMenuWrapper}>
          <Button variant="white" className={styles.button} onClick={toggleMenu}>
            {isMenuOpen ? <CrossIcon /> : <HamburgerIcon />}
          </Button>

          {isMenuOpen && (
            <ul className={styles.list}>
              <li className={styles.item}>
                <AccountBalance className={styles.balance} />
              </li>
              <li className={clsx(styles.item, styles['item--wallet'])}>
                <Wallet />
              </li>
            </ul>
          )}
        </div>

        <div className={styles.configuration}>
          {isAccountReady && <Search />}

          <div className={styles.desktopMenu}>
            {!!account && <span className={styles.separator} />}

            <div className={styles.desktopWallet}>
              {!!account && isAvailableBalanceReady && <AccountBalance className={styles.balance} />}

              <Wallet />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}

export { Header };
