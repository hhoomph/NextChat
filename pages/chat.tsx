/* eslint-disable react-hooks/exhaustive-deps */
// import { GetServerSideProps } from "next";
// import nextCookies from "next-cookies";
import React, { useState, useEffect, useCallback, useMemo } from "react";
// import Link from "next/link";
import Layout from "../components/Layout";
import { withAuthSync } from "../utils/auth";
import { NextPage } from "next";
import { useSocketIo, useSocketListener, useSocketManagerListener } from "../contexts/SocketIoContext";
import { User, MessageType } from "../types/Types";
import { useReceiver } from "../contexts/ReceiverContext";
import Image from "next/image";
import UserButton from "../components/UserButton";
import Message from "../components/Message";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { CSSTransition } from "react-transition-group";
import fetchData from "../utils/fetchData";
import jsCookie from "js-cookie";
import { animateScroll, Element } from "react-scroll";
import { removeDuplicateObjects } from "../utils/tools";
const token = jsCookie.get("token");
// import { useRouter } from "next/router";
interface Props {
  user?: User;
}
const ChatPage: NextPage<Props> = ({ user }: Props) => {
  const [message, setMessage] = useState("");
  const [allMessage, setAllMessage] = useState<MessageType[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newMsg, setNewMsg] = useState<MessageType | null>(null);
  const toggleNeMsg = () => {
    setNewMsg(null);
    setToast(false);
  };
  // const router = useRouter();
  const [toast, setToast] = useState<boolean>(false);
  const toggleToast = () => {
    setToast(!toast);
  };
  const showToast = toast ? " show " : " hide";
  const toastRef = React.useRef(null);
  const { receiverUser } = useReceiver();
  const getUser = async (user: string | undefined): Promise<User | false> => {
    const res = await fetchData(
      `/api/users/get?user=${user}`,
      {
        method: "GET",
      },
      token
    );
    if (res && res.newUser) {
      return res.newUser;
    } else {
      return false;
    }
  };
  const socket = useSocketIo();
  useSocketListener("new_message", async (data: MessageType) => {
    if (receiverUser.username == null || (receiverUser.username != data.receiver && receiverUser.username != data.sender)) {
      const newM = data;
      let date = newM?.createdAt ? new Date(newM?.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString();
      newM.createdAt = date;
      const newUser = await getUser(newM.sender);
      if (newUser && newUser.username != undefined) {
        let _allUsers = allUsers;
        let exist = _allUsers.find((o) => o.username === newUser.username);
        if (exist && exist.username != undefined) {
          _allUsers.map((u) => {
            if (u.username == newUser.username) {
              u.messageCount = u.messageCount ? u.messageCount + 1 : 1;
            }
          });
        } else {
          newUser.messageCount = 1;
          _allUsers = [..._allUsers, newUser];
        }
        const users = _allUsers.filter((u: User) => u.username !== user?.username);
        setAllUsers(users);
      }
      setNewMsg(newM);
      setToast(true);
    } else {
      setAllMessage((messages) => [...messages, data]);
      const newUser = await getUser(data.sender);
      if (newUser && newUser.username != undefined) {
        let _allUsers = allUsers;
        let exist = _allUsers.find((o) => o.username === newUser.username);
        if (exist && exist.username != undefined) {
          _allUsers.map((u) => {
            if (u.username == newUser.username) {
              u.messageCount = u.messageCount ? u.messageCount + 1 : 1;
            }
          });
        } else {
          newUser.messageCount = 1;
          _allUsers = [..._allUsers, newUser];
        }
        const users = _allUsers.filter((u: User) => u.username !== user?.username);
        setAllUsers(users);
      }
      animateScroll.scrollToBottom({
        containerId: "messages_wrapper",
        // smooth: true,
        to: "messages_wrapper",
        delay: 50,
        smooth: "easeInOutQuint",
        offset: 150,
        isDynamic: true,
      });
    }
  });
  useSocketManagerListener("reconnect", () => socket.emit("initUser"));
  useEffect(() => {
    socket.open();
    socket.emit("initUser");
    if (socket.connected) {
      return () => {
        // socket.close();
        // socket.disconnect();
      };
    }
  }, []);
  // useEffect(() => {
  //   socket.on("new_message", (data) => {
  //     setAllMessage([...allMessage, data]);
  //     animateScroll.scrollToBottom({
  //       containerId: "messages_wrapper",
  //       to: "messages_wrapper",
  //       offset: 150,
  //     });
  //   });
  //   if (socket)
  //     return () => {
  //       socket.off("new_message");
  //     };
  // }, []);
  useEffect(() => {
    const getMessages = async () => {
      const response = await fetchData(
        "/api/message/message",
        {
          method: "POST",
          body: JSON.stringify({
            username: user?.username,
            receiver: receiverUser.username,
          }),
        },
        token
      );
      if (response && response?.status == 200 && response?.messages != undefined) {
        const filteredArr = removeDuplicateObjects(response.messages);
        setAllMessage(filteredArr);
        animateScroll.scrollToBottom({
          containerId: "messages_wrapper",
          to: "messages_wrapper",
        });
      }
    };
    if (receiverUser?.username) {
      getMessages();
    }
  }, [receiverUser, user?.username]);
  const showMessages = useMemo(
    () =>
      allMessage?.map((msg) => {
        return <Message key={msg._id} user={user} message={msg} />;
      }),
    [allMessage, user]
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  const addEmoji = (emoji: any) => {
    const text = `${message} ${emoji.native} `;
    setMessage(text);
    setShowEmojiPicker(!showEmojiPicker);
  };
  const showEmoji = useMemo(() => {
    return (
      <div className="emoji_icon">
        <a className="" title="emoji" onClick={toggleEmojiPicker}>
          <Image src="/icons/lol.svg" alt="Emoji Icon" width={30} height={30} />
        </a>
        {showEmojiPicker ? <Picker title="Emoji" set="twitter" onSelect={addEmoji} onClick={toggleEmojiPicker} /> : null}
      </div>
    );
  }, [showEmojiPicker]);
  const sendMessage = useCallback(() => {
    if (message != "") {
      const data: MessageType = {
        sender: user?.username,
        receiver: receiverUser.username,
        content: message,
      };
      socket.emit("chat_message", data);
      setMessage("");
      // setAllMessage([...allMessage, data]);
    }
  }, [message, receiverUser.username, socket, user?.username]);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };
  useEffect(() => {
    const getAllUsers = async () => {
      const res = await fetchData(
        "/api/users/get",
        {
          method: "POST",
          body: JSON.stringify({
            username: user?.username,
          }),
        },
        token
      );
      if (res && res.users) {
        const users = res.users.filter((u: User) => u.username !== user?.username);
        setAllUsers(users);
      }
    };
    getAllUsers();
  }, [socket]);
  const showUsers = useMemo(
    () =>
      allUsers?.map((usr) => {
        return <UserButton key={usr._id} user={usr} newMsg={newMsg} toggleNeMsg={toggleNeMsg} />;
      }),
    [allUsers, newMsg, socket]
  );
  const deleteMessages = async () => {
    await fetchData(
      "/api/message/delete",
      {
        method: "POST",
        body: JSON.stringify({
          usrName: user?.username,
          receiverName: receiverUser.username,
        }),
      },
      token
    );
    toggleModal();
    toggleMenu();
    setAllMessage([]);
  };
  const [menu, setMenu] = useState<boolean>(false);
  const toggleMenu = () => {
    setMenu(!menu);
  };
  const showMenu = menu ? " show " : "";
  const nodeRef = React.useRef(null);
  const [modal, setModal] = useState<boolean>(false);
  const toggleModal = () => {
    setModal(!modal);
  };
  const showModal = modal ? { display: "block", transition: "all 250ms ease-in-out" } : { display: "none", transition: "all 250ms ease-in-out" };
  const modalRef = React.useRef(null);
  return (
    <Layout title="چت" user={user}>
      <div className="container-fluid chat_wrapper">
        <div className="row mt-4 g-4">
          {receiverUser.username && (
            <div className="col-12 text-center receiver_username">
              <h4>{receiverUser.username}</h4>
            </div>
          )}
          <div className="col-4 col-md-4 col-lg-3 border-start border-warning min_h justify-content-center pt-2 users">{showUsers}</div>
          <div className="col-8 col-md-8 col-lg-9 border-warning min_h messages" id="messages_wrapper">
            <Element name="messages_wrapper">
              {receiverUser.username && (
                <div className="dot_menu_wrapper">
                  <Image
                    src="/icons/three-dots.svg"
                    alt="پاک کردن تاریخچه پیام ها"
                    width={30}
                    height={30}
                    className="btn btn-outline-warning btn-sm dropdown-toggle"
                    data-bs-toggle="dropdownMenuButton2"
                    aria-expanded="false"
                    onClick={toggleMenu}
                  />
                  <CSSTransition timeout={100} classNames="fade" in={menu} nodeRef={nodeRef}>
                    <ul className={"dropdown-menu" + showMenu} aria-labelledby="dropdownMenuButton2" ref={nodeRef}>
                      {receiverUser.username && (
                        <li>
                          <a className="btn btn-outline-danger btn-sm delete_messages" onClick={toggleModal}>
                            حذف تاریخچه پیام ها
                          </a>
                        </li>
                      )}
                      {/* <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Separated link
                  </a>
                </li> */}
                    </ul>
                  </CSSTransition>
                  <CSSTransition timeout={300} appear={true} classNames="fade" in={modal} nodeRef={modalRef}>
                    <div
                      className="modal fade show"
                      id="staticBackdrop"
                      data-bs-backdrop="static"
                      tabIndex={-1}
                      aria-labelledby="staticBackdropLabel"
                      aria-hidden="true"
                      style={showModal}
                    >
                      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title">{/* Modal title */}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={toggleModal}></button>
                          </div>
                          <div className="modal-body">آیا از حذف تمامی پیام های این گفتگو مطمئن هستید؟</div>
                          <div className="modal-footer justify-content-between">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={toggleModal}>
                              لغو
                            </button>
                            <button type="button" className="btn btn-warning" onClick={deleteMessages}>
                              تایید
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CSSTransition>
                </div>
              )}
              {showMessages}
            </Element>
          </div>
          <div className="row justify-content-end text_wrap">
            <div className="col-sm-12 col-md-8 col-lg-9">
              <form className="col-sm-12 col-md-10 g-2 text_message">
                <div className="form-floating d-flex align-items-center">
                  <textarea
                    className="form-control"
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e)}
                    id="message_input"
                    placeholder="اینجا بنویس"
                    rows={3}
                    value={message}
                  ></textarea>
                  <label htmlFor="message_input" className="form-label">
                    پیامت رو اینجا بنویس
                  </label>
                  <a className="send_btn" title="ارسال" onClick={sendMessage}>
                    <Image src="/icons/send.svg" alt="Send Button" width={40} height={40} />
                  </a>
                  {showEmoji}
                </div>
              </form>
            </div>
          </div>
          <div className="position-fixed bottom-0 end-0 p-3 toast_wrapper">
            {toast && (
              <CSSTransition timeout={100} classNames="fade" in={toast} nodeRef={toastRef}>
                <div id="liveToast" className={"toast" + showToast} role="alert" aria-live="assertive" aria-atomic="true">
                  <div className="toast-header">
                    <span>{newMsg?.createdAt}</span>
                    <strong className="ms-auto">{newMsg?.sender}</strong>
                    <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={toggleToast}></button>
                  </div>
                  <div className="toast-body">{newMsg?.content}</div>
                </div>
              </CSSTransition>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default withAuthSync(ChatPage);
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { token } = nextCookies(context);
//   const messages = await fetchData(
//     "/api/message/message",
//     {
//       method: "POST",
//       body: JSON.stringify({
//         username: user?.username,
//         receiver: receiverUser,
//       }),
//     },
//     token
//   );
//   return { messages };
// };