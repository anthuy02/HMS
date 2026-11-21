import React, { useState } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Size styling
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      padding: '6px 14px',
      fontSize: '12px',
      height: '32px',
      borderRadius: '6px',
      gap: '6px',
    },
    md: {
      padding: '9px 18px',
      fontSize: '13.5px',
      height: '40px',
      borderRadius: '8px',
      gap: '8px',
    },
    lg: {
      padding: '12px 24px',
      fontSize: '15px',
      height: '48px',
      borderRadius: '10px',
      gap: '10px',
    },
  };

  // Base luxury color styles based on Figma
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered && !disabled ? '#362017' : '#482e24',
          color: '#f8f5ec',
          border: '1px solid #482e24',
          boxShadow: isHovered && !disabled ? '0 2px 8px rgba(72, 46, 36, 0.25)' : 'none',
        };
      case 'secondary':
        return {
          backgroundColor: isHovered && !disabled ? '#f3eee4' : '#ffffff',
          color: '#482e24',
          border: '1px solid #d9d5cc',
          boxShadow: isHovered && !disabled ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none',
        };
      case 'gold':
        return {
          backgroundColor: isHovered && !disabled ? '#82684f' : '#95785c',
          color: '#ffffff',
          border: '1px solid #95785c',
          boxShadow: isHovered && !disabled ? '0 2px 8px rgba(149, 120, 92, 0.3)' : 'none',
        };
      case 'outline':
        return {
          backgroundColor: isHovered && !disabled ? 'rgba(72, 46, 36, 0.07)' : 'transparent',
          color: '#482e24',
          border: '1.5px solid #482e24',
        };
      case 'danger':
        return {
          backgroundColor: isHovered && !disabled ? '#9e1616' : '#ba1a1a',
          color: '#ffffff',
          border: '1px solid #ba1a1a',
          boxShadow: isHovered && !disabled ? '0 2px 8px rgba(186, 26, 26, 0.25)' : 'none',
        };
      case 'ghost':
        return {
          backgroundColor: isHovered && !disabled ? 'rgba(72, 46, 36, 0.06)' : 'transparent',
          color: '#482e24',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const combinedStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Nimbus Sans", "Plus Jakarta Sans", -apple-system, sans-serif',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'all 0.18s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    boxSizing: 'border-box',
    ...sizeStyles[size],
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={combinedStyles}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      {...rest}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
        </>
      )}
    </button>
  );
};
