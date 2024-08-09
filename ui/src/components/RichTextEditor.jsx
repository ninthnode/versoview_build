import React, { useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
const RichTextEditor = ({handleTextBodyChange}) => {
    const editor = useRef(null);
    const [content, setContent] = useState('');

    const config = {
        readonly: false,
        placeholder: 'Start typing...',
        minHeight: '300px',
    };

    return (
        <div>
            <JoditEditor
                ref={editor}
                value={content}
                config={config}
                onBlur={newContent => {setContent(newContent);handleTextBodyChange(newContent)}}
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
