import React, { useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
const RichTextEditor = ({handleTextBodyChange,bodyRichText}) => {
    const editor = useRef(null);

    const config = {
        readonly: false,
        placeholder: 'Start typing...',
        minHeight: '300px',
        overflow: 'auto',
        askBeforePasteFromWord: false,
              askBeforePasteHTML: false
    };

    return (
        <div>
            <JoditEditor
                ref={editor}
                value={bodyRichText}
                config={config}
                onBlur={newContent => {handleTextBodyChange(newContent)}}
                onChange={newContent => {}}
                minH="2xl"
            />
            {/* <div style={{ marginTop: '20px' }}>
                <h3>Content:</h3>
                <div>{content}</div>
            </div> */}
        </div>
    );
};

export default RichTextEditor;
