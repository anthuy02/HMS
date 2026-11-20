import React from 'react';
import { formatCurrencyVND } from '../../utils/formatters';

interface CurrencyDisplayProps {
  amount: number;
  color?: string;
  isBold?: boolean;
  fontSize?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  color = '#0f172a',
  isBold = true,
  fontSize = '14px',
}) => {
  return (
    <span
      style={{
        color,
        fontWeight: isBold ? 700 : 400,
        fontSize,
        fontFamily: 'monospace, sans-serif',
      }}
    >
      {formatCurrencyVND(amount)}
    </span>
  );
};
