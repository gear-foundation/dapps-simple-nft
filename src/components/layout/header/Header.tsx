import { Wallet } from 'features/wallet';
import { NodeSwitch } from 'features/node-switch';
import { ContractAddress, useContractAddress } from 'features/contract-address';
import { Search } from 'features/nfts';
import { Container } from '../container';
import { Logo } from './logo';
import styles from './Header.module.scss';

function Header() {
  const contractAddress = useContractAddress();

  return (
    <header>
      <Container className={styles.container}>
        <Logo />

        <div className={styles.wrapper}>
          <Search />

          <div className={styles.addresses}>
            <ContractAddress />
            {contractAddress && <span className={styles.separator} />}
            <NodeSwitch />
          </div>

          <Wallet />
        </div>
      </Container>
    </header>
  );
}

export { Header };
