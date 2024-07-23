import React from 'react';

interface EventProps {
  title: React.ReactNode | undefined;
  description?: React.ReactNode;
}

const CustomEvent: React.FC<EventProps> = props => {
  const { title, description } = props;
  return (
    <div className="flex flex-col h-full justify-center items-center bg-selection-1">
      <label className="text-xs md:text-sm">{title}</label>
      <label className="text-[10px] md:text-xs">{description}</label>
    </div>
  );
};

export default CustomEvent;
