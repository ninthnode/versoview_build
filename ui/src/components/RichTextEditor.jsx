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
      paste: {
        clean: true, // Ensures that pasted content is stripped of unwanted styles
        removeStyles: true, // Removes inline styles
        removeClasses: true, // Removes classes
        keepStyles: false // Prevents any styles from being retained
    }
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
        </div>
    );
};

export default RichTextEditor;
