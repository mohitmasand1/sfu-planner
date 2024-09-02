import React from 'react';

interface EventProps {
  title: React.ReactNode | undefined;
  description?: React.ReactNode;
  className?: string;
}

const CustomEvent: React.FC<EventProps> = props => {
  const { title, description, className } = props;
  return (
    <div
      className={`flex flex-col h-full justify-center items-center bg-selection-1 border-y-[1px] border-gray-500 border-dashed ${className}`}
    >
      <label className="text-xs md:text-sm text-black">{title}</label>
      <label className="text-[10px] md:text-xs text-black">{description}</label>
    </div>
  );
};

export default CustomEvent;
