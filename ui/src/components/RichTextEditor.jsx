import React, { useRef, forwardRef, useMemo, useEffect,useState } from "react";
import JoditEditor,{Jodit} from "jodit-react";
import { useDisclosure } from "@chakra-ui/react";
import LibraryImageSelector from "./publish/LibraryImageSelector";

const RichTextEditor = forwardRef(
  (
    {
      initialValue = "",
      onChange = () => {},
      name = "",
      placeholderText = "",
      showExtraButtons = false,
      handleTextBodyChange,
      bodyRichText,
      editionId,
      postId = null
    },
    ref
  ) => {
    const editorRef = useRef(null);
    const cursorPositionRef = useRef(null); // Store cursor position
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);

    // Add effect to handle bodyRichText if passed directly
    useEffect(() => {
      if (bodyRichText && editorRef.current && editorRef.current.value !== bodyRichText) {
        editorRef.current.value = bodyRichText;
      }
    }, [bodyRichText]);

    const saveCursorPosition = () => {
      const editorInstance = editorRef.current;
      if (editorInstance) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          cursorPositionRef.current = selection.getRangeAt(0).cloneRange();
        }
      }
    };

    const restoreCursorPosition = () => {
      if (cursorPositionRef.current) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(cursorPositionRef.current);
      }
    };

    const handleLibraryImage = (img) => {
      console.log(img)
      injectImage(img);
      onClose();
    };
    const injectImage = (img) => {
      const editorInstance = editorRef.current;
      if (editorInstance && cursorPositionRef.current) {
        const range = cursorPositionRef.current;
        range.deleteContents();
        const imgNode = document.createElement("img");
        imgNode.src = img;
        range.insertNode(imgNode);
        range.collapse(false);
        restoreCursorPosition();

        const updatedContent = editorInstance.value || editorInstance.innerHTML;
        if (onChange) {
          onChange(name, updatedContent);
        }
      }
    };
    const insertImageUrlButton = {
      name: "insertImageUrl",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21 3H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8.5 13.5l2.5 3.01L15.5 12l4.5 6H4l4.5-5.5z"/></svg>',
      tooltip: "Insert Image",
      exec: (editor) => {
        // Focus the editor and save the cursor position
        editor.selection.focus();
        saveCursorPosition();
        // Slightly delay opening the modal to ensure focus is set
        setTimeout(() => {
          setIsLibraryModalOpen(true);
        }, 0);
      },
    };

    const config = useMemo(
      () => ({
        buttons: [
          "bold",
          "italic",
          "|",
          "ul",
          "ol",
          "|",
          "font",
          "fontsize",
          "brush",
          "paragraph",
          "|",
          "table",
          "link",
          "|",
          "left",
          "center",
          "right",
          "justify",
          "|",
          "undo",
          "redo",
          "|",
          "hr",
          "eraser",
          "fullsize",
        ],
        extraButtons: [insertImageUrlButton],
        removeButtons: ["brush", "file"],
        showXPathInStatusbar: false,
        showCharsCounter: false,
        showWordsCounter: false,
        toolbarAdaptive: false,
        theme: "default",
        height: 500,
        askBeforePasteFromWord: false,
        askBeforePasteHTML: false,
        processPasteHTML: true,
        defaultActionOnPaste: "insert_only_text",
        nl2brInPlainText: false,
        contentStyle: "a { color: red !important; }",
        events: {
          click: saveCursorPosition,
          keyup: saveCursorPosition,
          focus: restoreCursorPosition,
          beforeInit: (jodit) => {
            jodit.events.on("paste", (e) => {
              e.preventDefault();
              const transferredData = Jodit.modules.Helpers.getDataTransfer(e);
              if (!transferredData) return;
      
              const textAsPlain = transferredData.getData(Jodit.constants.TEXT_PLAIN);
      const singleLineText = textAsPlain.replace(/\n/g, ' '); // Replace newlines with spaces
                jodit.e.stopPropagation("paste");
                jodit.s.insertHTML(singleLineText)
            });
          },
      
          
          
        },
      }),
      [showExtraButtons]
    );

    return (
      <div className="text-editor-container">
        <JoditEditor
          ref={editorRef}
          config={config}
          value={bodyRichText || initialValue}
          tabIndex={1}
          onChange={(newContent) => {
            saveCursorPosition();
          }}
          onBlur={newContent => {handleTextBodyChange(newContent)}}
          placeholder={placeholderText || "Write something..."}
        />
        <LibraryImageSelector
            key="richtexteditor-library-selector"
            isOpen={isLibraryModalOpen}
            onClose={() => setIsLibraryModalOpen(false)}
            editionId={editionId}
            postId={postId}
            onImageSelect={handleLibraryImage}
          />  
      </div>
    );
  }
);
RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
