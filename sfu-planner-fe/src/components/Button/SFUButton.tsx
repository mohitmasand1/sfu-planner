import React, { FC } from 'react';
import { Button, ButtonProps as AntButtonProps } from 'antd';
import clsx from 'clsx';

/**
 * Variants your button might support.
 * Add more if needed (e.g., "primary", "secondary", "danger", etc.).
 */
type Variant = 'red' | 'green' | 'blue';

export interface MyButtonProps extends Omit<AntButtonProps, 'type'> {
  /**
   * Which color variant to use for the button.
   * Defaults to "red" in this example.
   */
  variant?: Variant;

  /**
   * Optionally pass any additional tailwind classes
   * if the user wants more custom control.
   */
  className?: string;
}

const SFUButton: FC<MyButtonProps> = ({
  children,
  variant = 'red',
  className,
  disabled,
  ...restProps
}) => {
  /**
   * Define base classes that apply to all variants
   */
  const baseClasses = `
    !text-white
  `;

  /**
   * Define variant-specific classes
   */
  const variantClasses: Record<Variant, string> = {
    red: `
      !bg-red-600 
      !border-red-600 
      hover:!bg-red-500 
      hover:!border-red-500
    `,
    green: `
      !bg-green-500 
      !border-green-500
      hover:!bg-green-400 
      hover:!border-green-400
      focus:!bg-green-400 
      focus:!border-green-400
    `,
    blue: `
      !bg-blue-500
      !border-blue-500
      hover:!bg-blue-400
      hover:!border-blue-400
      focus:!bg-blue-400
      focus:!border-blue-400
    `,
  };

  /**
   * Merge all relevant class names using clsx (or any similar approach).
   * The "!important" tailwind prefix ensures these classes override Ant Design defaults.
   */
  const mergedClassName = clsx(
    !disabled && baseClasses,
    !disabled && variantClasses[variant],
    className,
  );

  return (
    <Button className={mergedClassName} disabled={disabled} {...restProps}>
      {children}
    </Button>
  );
};

export default SFUButton;
