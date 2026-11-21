import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        ...style,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '32px',
              fontWeight: 700,
              color: '#482e24',
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: '-0.2px',
            }}
          >
            {title}
          </h1>
          {badge && (
            <span
              style={{
                fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: '#95785c',
                backgroundColor: 'rgba(149, 120, 92, 0.12)',
                border: '1px solid rgba(149, 120, 92, 0.25)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <p
            style={{
              fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", -apple-system, sans-serif',
              fontSize: '14px',
              color: '#73675e',
              marginTop: '6px',
              lineHeight: 1.5,
              margin: '6px 0 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
