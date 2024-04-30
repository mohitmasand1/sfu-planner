import React, { useState } from 'react';

interface TextWithToggleProps {
  text: string;
  max: number;
}

const TextWithToggle: React.FC<TextWithToggleProps> = ({ text, max }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const toggleText = () => setIsExpanded(!isExpanded);
  const shouldShowToggle = text.length > max;

  return (
    <>
      {shouldShowToggle ? (
        <p>
          {isExpanded ? text : `${text.substring(0, max)}...`}
          <a className="text-sky-500" onClick={toggleText}>
            {isExpanded ? ' show less' : 'show more'}
          </a>
        </p>
      ) : (
        <p>{text}</p>
      )}
    </>
  );
};

export default TextWithToggle;
