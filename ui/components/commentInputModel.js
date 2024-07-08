import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import {postCommentApi} from "../api/commentApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommentInputModel = ({ isOpen, onClose, handleModelClose, postId, selectedText, username}) => {
    const [commentText, setCommentText] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePost = async () => {
        if (selectedText && commentText) {
            const formData = {
                commentText: commentText,
                excerpt: selectedText,
            };
            
            const response = await postCommentApi(formData, postId);

            if (response.status === 201) {
                toast.success("Comment added!");
                onClose();
                setCommentText('');
                handleModelClose();
            } else {
                console.error('Failed to post comment:', response.message);
            }
        }
    };

    const modalStyle = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
            position: 'relative',
            top: isMobile ? '10px' : '40px',
            left: isMobile ? '0' : '270px',
            right: '0',
            border: 'none',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: isMobile ? '100%' : '45%',
            maxHeight: '100%',
            overflow: 'auto',
        },
    };

    const commentBoxStyle = {
        padding: isMobile ? '10px' : '20px',
        backgroundColor: '#eae5e5',
    };

    const commentFieldStyle = {
        width: isMobile ? '93%' : '96%',
        padding: '10px',
        borderRadius: '6px',
        height: '11vh',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        fontStyle: 'italic',
        fontSize: isMobile ? '14px' : '16px',
    };

    const commentPostBtnStyle = {
        backgroundColor: '#2BB11E',
        color: 'white',
        padding: isMobile ? '8px' : '10px',
        border: 'none',
        cursor: 'pointer',
        borderRadius: "5px"
    };

    const buttonBox = {
        display: 'flex',
        justifyContent: 'right',
    }

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Comment Modal"
            style={modalStyle}
        >
            <div style={{paddingBottom: "60px"}}>
                {/* <div style={{display: 'flex', justifyContent: 'right', alignItems: 'right'}}>
                    <button onClick={handleModelClose}>X</button>
                </div> */}
                <div style={commentBoxStyle}>
                    <div style={{position: "relative"}}>
                        <div style={{fontWeight: 'bold', marginBottom: '10px'}}>
                            <p style={{fontSize: '13px',fontFamily: 'sans-serif'}}>{username}</p>
                        </div>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Type here to post to chat"
                            style={commentFieldStyle}
                        />
                        
                        <div style={buttonBox}>
                        <button onClick={handlePost} style={commentPostBtnStyle}>
                            Post
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </ReactModal>
    );
};

export default CommentInputModel;



