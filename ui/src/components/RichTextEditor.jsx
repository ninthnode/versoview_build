import React, { useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import { uploadPostImage } from '../redux/posts/postActions';
import { useDispatch } from 'react-redux';

const RichTextEditor = ({handleTextBodyChange,bodyRichText}) => {
    const editor = useRef(null);
    const dispatch = useDispatch();

    const config = {
        readonly: false,
        placeholder: 'Start typing...',
        minHeight: '300px',
        overflow: 'auto',
        askBeforePasteFromWord: false,
        askBeforePasteHTML: false, 
        buttons: [
            'source',
            '|', 'bold', 'italic',
            '|', 'ul', 'ol',
            '|', 'font', 'fontsize', 'brush', 'paragraph',
            '|', 'video', 'table', 'link',
            '|', 'left', 'center', 'right', 'justify',
            '|', 'undo', 'redo',
            '|', 'hr', 'eraser', 'fullsize'
        ],
        extraButtons: ["image"],
      uploader: {         
        insertImageAsBase64URI: true,
        imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'svg', 'webp']
      },

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
