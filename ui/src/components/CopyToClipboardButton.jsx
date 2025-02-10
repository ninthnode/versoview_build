import React, { useState } from 'react';
import { Button, Tooltip } from '@chakra-ui/react';

const CopyToClipboardButton = ({textToCopy}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Tooltip label={isCopied ? 'Copied!' : 'Copy to clipboard'} hasArrow>
        <Button onClick={handleCopy} w='100%' variant="nostyle">
          {isCopied ? 'Link Copied' : 'Copy Link'}
        </Button>
      </Tooltip>
    </div>
  );
};

export default CopyToClipboardButton;
