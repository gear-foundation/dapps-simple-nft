import clsx from 'clsx';
import { PropsWithChildren } from 'react';
import { TVaraCoinIcon, VaraCoinIcon } from 'assets/images';
import { useAccountAvailableBalance } from 'features/available-balance/hooks';
import styles from './Balance.module.scss';
import { SVGComponent } from '../../../types';

type Props = PropsWithChildren & {
  className?: string;
  SVG: SVGComponent;
  value: string;
  unit?: string;
};

type HOCProps = Omit<Props, 'SVG' | 'children'>;

function Balance({ SVG, value, unit, className }: Props) {
  return (
    <span className={clsx(styles.wrapper, className)}>
      <SVG />
      <span className={styles.balance}>
        <b className={styles.amount}>{value}</b>
        {unit && <span className={styles.unit}>{unit}</span>}
      </span>
    </span>
  );
}

export function VaraBalance({ value, unit, className }: HOCProps) {
  return (
    <Balance
      SVG={unit?.toLowerCase() === 'vara' ? VaraCoinIcon : TVaraCoinIcon}
      value={value}
      unit={unit}
      className={className}
    />
  );
}

export function AccountBalance({ className }: Pick<HOCProps, 'className'>) {
  const { availableBalance: balance } = useAccountAvailableBalance();

  return <VaraBalance value={balance?.value || '0'} unit={balance?.unit || 'VARA'} className={className} />;
}

// function PointsBalance({ value, unit = 'PPV', className }: HOCProps) {
//   return <Balance SVG={BonusPointsIcon} value={value} unit={unit} className={className} />;
// }
