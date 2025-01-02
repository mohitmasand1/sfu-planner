import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string; // Allow custom class overrides
  style?: React.CSSProperties; // Allow inline style overrides
  bordered?: boolean; // Whether the card has a border
  shadow?: boolean; // Whether the card has a shadow
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style = {},
  bordered = true,
  shadow = true,
}) => {
  return (
    <div
      className={`inherit h-full w-full flex flex-col p-3 ${
        bordered ? 'border border-gray-300' : ''
      } ${shadow ? 'shadow-lg' : ''} bg-white ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
