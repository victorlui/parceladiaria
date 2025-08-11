import React from 'react';
import { Text, ActivityIndicator, Pressable, ViewStyle } from 'react-native';
import { clsx } from 'clsx';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  className,
}) => {
  const baseStyle = 'rounded-md px-4 py-3 items-center justify-center h-[50px]';

  const widthStyle = fullWidth ? 'w-full' : 'w-auto';

  const variantStyle = {
    primary: 'bg-[#7FD223]',
    secondary: 'bg-[#111224]',
    danger: 'bg-[#bb2124]',
    outline: 'bg-transparent border border-[#7FD223]',
  }[variant];

  const textColor = variant === 'outline' 
    ? 'text-[#7FD223] font-semibold text-[18px]'
    : 'text-white font-semibold text-[18px]';

  const disabledStyle = disabled || isLoading ? 'opacity-50' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      className={clsx(baseStyle, widthStyle, variantStyle, disabledStyle, className)}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#7FD223' : '#fff'} />
      ) : (
        <Text className={textColor}>{title}</Text>
      )}
    </Pressable>
  );
};
