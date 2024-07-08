import { useState, useEffect, useRef } from "react";
import styles from "../styles/home.module.css";
import chatsStyle from "../styles/chats.module.css";
import mydmsStyle from "../styles/mydms.module.css";
import globalStyles from "../styles/global.module.css";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.svg";
import search from "../public/images/search1.svg";
import rarible from "../public/images/rarible.png";
import community from "../public/images/community.svg";
import chatimg1 from "../public/images/chatimg1.svg";
import chatimg2 from "../public/images/chatimg2.svg";
import bookmark from "../public/images/outlinebookmark.svg";
import filledbookmark from "../public/images/filledbookmark.svg";
import menuicon from "../public/images/menu.svg";
import backarrow from "../public/images/backwardarrow.svg";
import ChatData from "../chatData.json";
import dummyData from "../mydmsDummyData.json";
import { FaLocationArrow } from "react-icons/fa";
import ServerUrl from "../context/production";
import { useRouter } from 'next/router';
import getChannelByName from "../api/authApi";
import socket from "../socket";

const MyChats = ({ device }) => {
  const [showShareBox, setShowShareBox] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [bookmarkStates, setBookmarkStates] = useState(
    Array(ChatData.length).fill(false)
  );
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');

  // socket io
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [profileData, setProfileData] = useState({});
  const chatBoxRef = useRef(null);

  // Scroll to the bottom of the chat box when a new message is added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const fetchData = async () => {
      try {
        const channelData = await getChannelByName();
        setProfileData(channelData);
      } catch (error) {
        console.error('Error fetching channel data:', error);
      }
    };

    fetchData();
  }, []);

  

  useEffect(() => {
    if (!profileData.userId) return;

    socket.emit('register', profileData.userId);
    console.log(`Registered user with ID: ${profileData.userId}`);

    socket.on('connect', () => {
      console.log('Connected to the socket server');
    });

    socket.on('dm', (message) => {
      console.log('Received private message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from the socket server');
    });

    return () => {
      socket.off('connect');
      socket.off('dm');
      socket.off('disconnect');
    };
  }, [profileData.userId]);

  const sendMessage = () => {
    if (currentMessage.trim() !== "" && userData.userId) {
      const messageData = {
        senderId: profileData.userId,
        receiverId: userData.userId,
        message: currentMessage,
      };
      socket.emit("private_message", messageData);
      console.log('Sent private message:', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setCurrentMessage("");
    }
  };

  // made this true while developing the chat section
  const [chatScreenVisible, setChatScreenVisible] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (router.query.userData) {
      try {
        setUserData(JSON.parse(router.query.userData));
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
  }, [router.query.userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareBox && !event.target.closest(`.${styles.shareContainer}`)) {
        setShowShareBox(false);
        setSelectedMenuIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showShareBox]);

  
  //fetch from db
  useEffect(() => {
    const fetchMessages = async () => {
      if (userData && profileData.userId) {
        try {
          const response = await fetch(`${ServerUrl}/api/v1/messages/${profileData.userId}/${userData.userId}`);
          const data = await response.json();

          const transformedMessages = data.map(msg => ({
            senderId: msg.senderId,
            receiverId: userData?.userId,
            message: msg.message,
            timestamp: msg.timestamp
          }));
          console.log(transformedMessages);
          setMessages(transformedMessages);

        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [userData, profileData.userId]);

  const handleBookmarkClick = (index) => {
    const newBookmarkStates = [...bookmarkStates];
    newBookmarkStates[index] = !newBookmarkStates[index];
    setBookmarkStates(newBookmarkStates);
  };

  const handleMenuIconClick = (index) => {
    setSelectedMenuIndex(index);
    setShowShareBox(!showShareBox);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  const goBack = () => {
    if (chatScreenVisible) {
      setChatScreenVisible(false);
    } else {
      router.back();
    }
  }

  return (
    <>
      {
        userData ?
          <div className={styles.container}>
            <div className={`${globalStyles.onlyDesktopFlex} ${globalStyles.searchOnDesktop}`}>
              <Image src={search} alt="searchIcon" style={{ width: 20, height: 20 }} />
              <span>
                <input type="text" placeholder="Search" className={chatsStyle.searchInput} />
              </span>
            </div>
            <div className={globalStyles.onlyDesktopFlex} style={{ width: "100%", height: 1.5, backgroundColor: '#707070', opacity: 0.1, marginTop: 6 }}></div>
            <div className={styles.heading}>
              <span className={styles.boardingHead1}>
                <Image className={globalStyles.onlyMobileFlex} src={logo} alt="logo" />
                <span className={globalStyles.onlyDesktopFlex} style={{ marginTop: -3 }}>My Chats</span>
                <span className={globalStyles.onlyMobileFlex} style={{ marginLeft: 10 }}>Chats</span>
              </span>
              <div className={`${styles.totalCountingDiv} ${globalStyles.onlyMobileFlex}`}>
                <Image src={community} alt="community" className={styles.userIcon} />
                <span className={styles.count}>23</span>
              </div>
            </div>
            <div className={globalStyles.onlyMobileFlex} style={{ width: "100%", height: 1.5, backgroundColor: '#707070', opacity: 0.1 }}></div>
            <div className={chatsStyle.boxContainer}>
              <div className={styles.homeNav}>
                <ul className={`${styles.navbar} ${chatsStyle.navbar}`}>
                  {device == 'mobile' ?
                    <Image src={backarrow} alt="backarrow" style={{ cursor: "pointer" }} className={`${chatsStyle.backarrow} ${globalStyles.onlyMobileFlex}`} onClick={goBack} />
                    :
                    <>
                      {chatScreenVisible &&
                        <Image src={backarrow} alt="backarrow" style={{ cursor: "pointer" }} className={`${chatsStyle.backarrow} ${globalStyles.onlyDesktopFlex}`} onClick={goBack} />
                      }
                    </>
                  }
                  <li className={styles.listStyle}>
                    <span onClick={() => handleTabChange("chats")} className={`${chatsStyle.linkStyle} ${activeTab === 'chats' ? chatsStyle.active : ''}`}>My Chats</span>
                  </li>
                  <li className={styles.listStyle}>
                    <span onClick={() => handleTabChange("dms")} className={`${chatsStyle.linkStyle} ${activeTab === 'dms' ? chatsStyle.active : ''}`}>My DMs</span>
                    <span className={chatsStyle.totalChat}>23</span>
                  </li>
                </ul>
              </div>
              <div style={{ width: "100%", height: 2, backgroundColor: '#707070', opacity: 0.1 }}></div>
              {!chatScreenVisible ?
                <div style={{ marginTop: 15 }}>
                  {activeTab === "chats"
                    ? ChatData.map((item, index) => {
                      return (
                        <div key={item.id}>
                          <div className={chatsStyle.chatConent}>
                            <span className={chatsStyle.comment}>{item.heading}</span>
                          </div>
                          <div className={chatsStyle.channelBar}>
                            <div className={chatsStyle.channelName}>
                              <Image src={chatimg2} alt="chatimg2" width="36px" height="36px" />
                              <span>
                                <p className={chatsStyle.title}>{item.title}</p>
                                <p className={chatsStyle.subTitle}>Nov 8&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;02:53 pm</p>
                              </span>
                            </div>
                            <div className={`${styles.alignCenter} ${styles.shareContainer}`}>
                              <Image src={menuicon} alt="menuicon" style={{ cursor: "pointer" }} onClick={() => handleMenuIconClick(index)} />
                              {showShareBox && selectedMenuIndex === index && (
                                <div className={chatsStyle.shareBox}>
                                  <p>SHARE</p>
                                </div>
                              )}
                              &nbsp;&nbsp;&nbsp;&nbsp;
                              <Image src={bookmarkStates[index] ? filledbookmark : bookmark} alt="bookmark" style={{ cursor: "pointer" }} onClick={() => handleBookmarkClick(index)} />
                            </div>
                          </div>
                          <div className={chatsStyle.chatBox}>
                            <div className={chatsStyle.chatline}></div>
                            <div className={chatsStyle.chatContent}>
                              <p className={chatsStyle.heading}>{item.dummyHeading}</p>
                              <p className={chatsStyle.description}>{item.dummyDesc}</p>
                            </div>
                            <div className={chatsStyle.chatContentBox}>
                              <p>{item.dummyPara}</p>
                            </div>
                          </div>
                          <div style={{ marginBottom: 15 }}>
                            {index === ChatData.length - 1 ? (
                              <div className={chatsStyle.alignItem}>
                                <p className={chatsStyle.viewstyle}>View all comments</p>
                                <a className={chatsStyle.reply}>Reply</a>
                              </div>
                            ) : (
                              <div className={chatsStyle.alignSingleItem}>
                                <a className={chatsStyle.reply}>Reply</a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                    : dummyData.map((item, index) => {
                      return (
                        <div key={item.id}>
                          <div className={mydmsStyle.outerContainer}>
                            <div className={chatsStyle.channelBar}>
                              <div className={chatsStyle.channelName}>
                                <Image src={rarible} alt="chatimg2" className={mydmsStyle.img} />
                                <span className={mydmsStyle.title}>{item.title}</span>
                              </div>
                            </div>
                          </div>
                          <div className={mydmsStyle.outerMessageBox}>
                            <div className={mydmsStyle.messageBox}>
                              <span className={mydmsStyle.textRegular}>{item.chat}</span>
                            </div>
                            <div className={mydmsStyle.messageTime}>
                              <span className={mydmsStyle.date}>Date&nbsp;&nbsp;|&nbsp;&nbsp;07:03 pm</span>
                              <a onClick={() => setChatScreenVisible(true)} className={mydmsStyle.reply}>Reply</a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                :
                // chatting screen 
                <>
                  <div style={{ marginTop: 15 }}>
                    <div className={chatsStyle.channelBar}>
                      <div className={chatsStyle.channelName}>
                        <Image src={userData.channelIconImageUrl} alt="chatimg2" width={36} height={36} />
                        <span style={{ paddingLeft: '1rem' }}>
                          <span className={chatsStyle.title}>{userData.channelName}</span>
                          <p className={chatsStyle.subTitle}>Nov 8&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;2:53 pm</p>
                        </span>
                      </div>
                      <div className={`${styles.alignCenter} ${styles.shareContainer}`}>
                        <Image src={menuicon} alt="menuicon" style={{ cursor: "pointer" }} onClick={() => handleMenuIconClick(index)} />
                        {showShareBox && selectedMenuIndex && (
                          <div className={chatsStyle.shareBox}>
                            <p>SHARE</p>
                          </div>
                        )}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Image src={bookmark} alt="bookmark" style={{ cursor: "pointer" }} />
                      </div>
                    </div>
                    <div className={chatsStyle.chatBox}>
                      {messages.map((message, index) => (
                        <div key={index}>
                          <div className={message.senderId == profileData.userId ? chatsStyle.chatSenderContentBox : chatsStyle.chatRecieverContentBox}>
                            <p>{message.message}</p>
                          </div>
                          <div className={mydmsStyle.messageTime}>
                            <span className={mydmsStyle.date}>Date&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;7:03 pm</span>
                          </div>
                        </div>
                      ))}
                      <div ref={chatBoxRef} />
                    </div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 70,
                    zIndex: 10,
                    width: '90%',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'space-between'
                  }}>
                    <input
                      style={{ width: '100%' }}
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}><FaLocationArrow size={23} /></button>
                  </div>
                </>
              }
            </div>
          </div>
          : <div>Loading...</div>
      }
    </>
  );
};

export default MyChats;
