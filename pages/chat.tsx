/* eslint-disable react-hooks/exhaustive-deps */
import { GetServerSideProps } from "next";
import nextCookies from "next-cookies";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import Link from "next/link";
import Layout from "../components/Layout";
import { withAuthSync, withAuthServerSideProps } from "../utils/auth";
import { NextPage, GetServerSidePropsContext } from "next";
// import { useSocketIo, useSocketListener, useSocketManagerListener } from "../contexts/SocketIoContext";
// import { useSocket } from "../contexts/SocketContext";
import { User, MessageType, Constraints } from "../types/Types";
import { useReceiver } from "../contexts/ReceiverContext";
import Image from "next/image";
import UserButton from "../components/UserButton";
import Message from "../components/Message";
// import Video from "../components/Video";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { CSSTransition } from "react-transition-group";
import fetchData from "../utils/fetchData";
import { animateScroll, Element } from "react-scroll";
import { removeDuplicateObjects } from "../utils/tools";
import { io as socketIo, Socket } from "socket.io-client";
import Peer, { Instance } from "simple-peer";
// import jsCookie from "js-cookie";
// const token = jsCookie.get("token");
const port = parseInt(process.env.PORT || "8080", 10);
const baseUrl = process.env.NODE_ENV !== "production" ? "http://localhost:" + port : "https://nextchatapp.herokuapp.com".replace(/^http/, "ws");
// import { useRouter } from "next/router";
interface Props {
  user?: User;
  props?: any;
}
const ChatPage: NextPage<Props> = ({ user, props }: Props) => {
  const { token, users } = props;
  const { receiverUser, setReceiverUser } = useReceiver();
  const [message, setMessage] = useState("");
  const [allMessage, setAllMessage] = useState<MessageType[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>(users);
  const [newMsg, setNewMsg] = useState<MessageType | null>(null);
  const toggleNeMsg = () => {
    setNewMsg(null);
    setToast(false);
  };
  const [audioNotif] = useState<HTMLAudioElement | any>(typeof Audio !== "undefined" && new Audio("/sound/Notification.mp3"));
  const [audioRing] = useState<HTMLAudioElement | any>(typeof Audio !== "undefined" && new Audio("/sound/RingTone.mp3"));
  // const router = useRouter();
  const [toast, setToast] = useState<boolean>(false);
  const toggleToast = () => {
    setToast(!toast);
  };
  const showToast = toast ? " show " : " hide";
  const toastRef = React.useRef(null);
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
  useEffect(() => {
    getAllUsers();
  }, [allMessage, receiverUser]);
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
  // const [inOrOutCall, setInOrOutCall] = useState<string>("");
  const getReceiverUserId = async (): Promise<void> => {
    const res = await fetchData(
      `/api/users/getId`,
      {
        method: "POST",
        body: JSON.stringify({
          username: receiverUser.username,
        }),
      },
      token
    );
    const u = res && res.user ? res.user : false;
    if (u) {
      const newUsr = receiverUser;
      newUsr.ID = u.socketId;
      setReceiverUser(newUsr);
      setCaller(u.socketId);
      return u.socketId;
    } else {
      return undefined;
    }
  };
  const iniSocket = socketIo(baseUrl, {
    withCredentials: true,
    query: token ? { token } : undefined,
    autoConnect: false,
    multiplex: false,
    transports: ["websocket"],
    upgrade: false,
    jsonp: false,
    reconnection: true,
    reconnectionDelay: 500,
  });
  const [socket, setSocket] = useState<Socket>(iniSocket);
  // const socket = useSocketIo();
  // const [socket] = useSocket();
  useEffect(() => {
    if (socket) {
      socket.open();
      socket.connect();
      socket.emit("initUser");
    }
    setSocket(socket);
    socket.io.on("reconnect", () => {
      socket.emit("initUser");
    });
    socket.on("connect_error", () => {
      setTimeout(() => {
        socket.connect();
      }, 1000);
    });
    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      }
      // else the socket will automatically try to reconnect
    });
    if (socket?.connected) {
      return () => {
        socket.io.off("reconnect");
        socket.off("connect_error");
        socket.off("disconnect");
        socket.close();
        socket.disconnect();
      };
    }
  }, [socket]);
  useEffect(() => {
    socket?.on("new_message", async (data: MessageType) => {
      if (receiverUser.username == "" || (receiverUser.username != data.receiver && receiverUser.username != data.sender)) {
        audioNotif.play();
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
          let exist2 = _allUsers.find((o) => o.username === receiverUser.username);
          if (exist2 && exist2.username != undefined) {
          } else {
            _allUsers = [..._allUsers, receiverUser];
          }
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
    return () => {
      socket?.off("new_message");
    };
  }, [socket, receiverUser]);
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
        return <Message key={msg._id} user={user} message={msg} socket={socket} />;
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
      <div className="emoji_icon" onBlurCapture={toggleEmojiPicker}>
        <a className="" title="emoji" onClick={toggleEmojiPicker}>
          <Image src="/icons/lol.svg" alt="Emoji Icon" width={30} height={30} />
        </a>
        {showEmojiPicker ? <Picker title="Emoji" set="twitter" onSelect={addEmoji} onClick={toggleEmojiPicker} /> : null}
      </div>
    );
  }, [showEmojiPicker]);
  const sendMessage = useCallback(() => {
    if (message != "" && receiverUser?.username != undefined) {
      const data: MessageType = {
        sender: user?.username,
        receiver: receiverUser.username,
        content: message,
      };
      socket?.emit("chat_message", data);
      setMessage("");
      // setAllMessage([...allMessage, data]);
    }
  }, [message, receiverUser.username, user?.username]);
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };
  const showUsers = useMemo(
    () =>
      allUsers?.map((usr) => {
        return <UserButton key={usr._id} user={usr} newMsg={newMsg} toggleNeMsg={toggleNeMsg} socket={socket} onClick={getReceiverUserId} />;
      }),
    [allUsers, newMsg, socket, allMessage]
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
  // let pc: RTCPeerConnection;
  // const pc = useRef();
  //  Peer Connection
  const [callModal, setCallModal] = useState<boolean>(false);
  // const toggleCallModal = () => {
  //   setCallModal(!callModal);
  // };
  const showCallModal = callModal ? { display: "block", transition: "all 250ms ease-in-out" } : { display: "none", transition: "all 250ms ease-in-out" };
  // const callModalRef = React.useRef(null);
  const [enterModal, setEnterModal] = useState<boolean>(false);
  const enterModalRef = React.useRef(null);
  const [videoBtn, setVideoBtn] = useState<boolean>(false);
  const minimizeVideo = () => {
    setCallModal(false);
    setVideoBtn(true);
  };
  const maximizeVideo = () => {
    setVideoBtn(false);
    setCallModal(true);
  };
  const [placeholder, setPlaceholder] = useState<boolean>(true);
  const [stream, setStream] = useState<MediaStream>();
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [receivingCall, setReceivingCall] = useState(false);
  const [recording] = useState<boolean>(true);
  // const [recording, setRecording] = useState<boolean>(true);
  // const toggleRecording = () => {
  //   setRecording(!recording);
  // };
  useEffect(() => {
    getReceiverUserId();
  }, [receiverUser, receivingCall, enterModal]);
  const [caller, setCaller] = useState<string>("");
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  // const [idToCall, setIdToCall] = useState<any>("");
  const showEnterModal =
    enterModal && !callAccepted ? { display: "block", transition: "all 250ms ease-in-out" } : { display: "none", transition: "all 250ms ease-in-out" };
  const [name, setName] = useState<string>("");
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Instance>();
  const [answer, setAnswer] = useState<string>("");
  const [calling, setcalling] = useState<boolean>(false);
  useEffect(() => {
    socket.on("startCall", (data) => {
      console.log("startCall");
      audioRing.play();
      // setReceivingCall(true);
      setEnterModal(true);
      if (data.from !== socket.id) {
        setName(data.fromName);
        setCaller(data.from);
        // setReceivingCall(true);
      } else {
        setName(data.name);
        setCaller(data.userToCall);
      }
      if (data.startCall) {
        setcalling(true);
      }
    });
  }, [socket]);
  const [audio, setAudio] = useState<boolean>(true);
  const toggleAudio = () => {
    setAudio(!audio);
  };
  const [video, setVideo] = useState<any>({
    width: 600,
    height: 440,
  });
  const toggleVideo = () => {
    if (video) {
      setVideo(false);
    } else {
      setVideo({
        width: 600,
        height: 440,
      });
    }
  };
  const [constraints] = useState<Constraints>({
    audio: audio,
    video: video,
    aspectRatio: 1.7777777778,
    echoCancellation: true,
    // width: { min: 640, max: 640 },
    // height: { min: 480, max: 480 },
  });
  const getLocalPrevie = () => {
    setPlaceholder(false);
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        setLocalStream(stream);
        // connectionRef?.current?.addStream(stream)
        let video = myVideo.current;
        if (video) {
          video.srcObject = stream;
        }
        video?.play().catch((e) => {
          console.log(e);
        });
      })
      .catch((error) => {
        console.log("error occurred when trying to get an access to camera ");
        console.log(error);
      });
  };
  let timeOut: any;
  useEffect(() => {
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      setStream(stream);
      setLocalStream(stream);
      if (myVideo?.current) {
        myVideo.current.srcObject = stream;
        myVideo.current?.addEventListener("loadedmetadata", () => {
          myVideo.current?.play().catch((e) => {
            console.log(e);
          });
        });
      }
    });
    socket.on("callUser", (data) => {
      console.log("calluser");
      // getLocalPrevie();
      if (data.answer) {
        setAnswer(data.answer);
        timeOut = setTimeout(() => {
          setEnterModal(false);
        }, 3000);
        // setTimeout(() => {
        //   setEnterModal(false);
        // }, 3000);
      } else {
        setReceivingCall(true);
        // setEnterModal(true);
        setCaller(data.from);
        setName(data.name);
        setCallerSignal(data.signal);
      }
    });
    socket.on("endCall", () => {
      console.log("endCall");
      setName("");
      setCaller("");
      setReceivingCall(false);
      setEnterModal(false);
      setCallModal(false);
      setVideoBtn(false);
      setCallAccepted(false);
      setCallOut(false);
      audioRing.pause();
      audioRing.currentTime = 0;
      if (connectionRef.current) connectionRef.current.destroy();
    });
    return () => clearTimeout(timeOut);
  }, [socket]);
  useEffect(() => {
    // getLocalPrevie();
    if (myVideo.current && localStream) {
      myVideo.current.srcObject = localStream;
    }
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
    if (userVideo.current && remoteStream) {
      userVideo.current.srcObject = remoteStream;
    }
    let video = myVideo.current;
    video?.addEventListener("loadedmetadata", () => {
      video?.play().catch((e) => {
        console.log(e);
      });
    });
  }, [receivingCall, callAccepted, calling, videoBtn, localStream, stream, remoteStream]);
  const [callOut, setCallOut] = useState(false);
  const callUser = async (id: string | undefined = receiverUser.ID) => {
    setCallOut(true);
    await getReceiverUserId();
    setAnswer("");
    getLocalPrevie();
    setEnterModal(true);
    socket.emit("startCall", {
      userToCall: receiverUser.ID,
      from: socket.id,
      fromName: user?.username,
      name: receiverUser.username,
    });
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    // peer._debug = console.log;
    setPlaceholder(false);
    peer.once("signal", (data) => {
      socket.emit("callUser", {
        userToCall: receiverUser.ID,
        signalData: data,
        from: socket.id,
        name: receiverUser.username,
      });
    });
    peer.on("stream", (stream) => {
      setRemoteStream(stream);
      if (userVideo.current) userVideo.current.srcObject = stream;
    });
    socket.once("callAccepted", (signal) => {
      setCallAccepted(true);
      setPlaceholder(false);
      setCallModal(true);
      peer.signal(signal);
      audioRing.pause();
    });
    if (connectionRef.current) connectionRef.current = peer;
  };
  const answerCall = async () => {
    setCallAccepted(true);
    setCallModal(true);
    setPlaceholder(false);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    // peer._debug = console.log;
    peer.signal(callerSignal);
    peer.once("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      setRemoteStream(stream);
      if (userVideo.current) userVideo.current.srcObject = stream;
    });
    connectionRef.current = peer;
  };
  const leaveCall = () => {
    setEnterModal(false);
    setCallModal(false);
    setVideoBtn(false);
    setCallOut(false);
    setName("");
    setCaller("");
    audioRing.pause();
    audioRing.currentTime = 0;
    socket.emit("endCall", {
      userToCall: caller ? caller : receiverUser.ID,
      userId: socket.id,
    });
    if (connectionRef.current) connectionRef.current.destroy();
  };
  const ShowVideo = () => {
    return (
      <CSSTransition timeout={300} appear={true} classNames="fade" in={enterModal} nodeRef={enterModalRef}>
        <>
          <div
            className="modal fade show"
            id="enter_modal"
            data-bs-backdrop="static"
            tabIndex={-1}
            aria-labelledby="enter_modal"
            aria-hidden="true"
            style={showEnterModal}
          >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="user_info">
                    <div className="usr_img">
                      <Image src="/icons/person-square.svg" alt="User" width={200} height={200} />
                    </div>
                    <div className="usr_name">{receiverUser.username ? receiverUser.username : name}</div>
                    {answer !== "" && answer !== "CALL_ACCEPTED" && <div className="call_info">{answer}</div>}
                  </div>
                </div>
                <div className="modal-footer text-center">
                  <div className="video_icon call_cancel" onClick={leaveCall}>
                    <Image src="/icons/telephone-x-red.svg" alt="Cancel Call" width={35} height={35} />
                  </div>
                  {caller !== socket.id && (
                    <>
                      {receivingCall ? (
                        <div
                          className="video_icon call_accept"
                          onClick={async () => {
                            await answerCall();
                          }}
                        >
                          <Image src="/icons/telephone-inbound.svg" alt="Accept Call" width={35} height={35} />
                        </div>
                      ) : (
                        !callOut && (
                          <div className="video_icon call_accept">
                            <div className="spinner-border text-success" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal fade show"
            id="video_modal"
            data-bs-backdrop="static"
            tabIndex={-1}
            aria-labelledby="video_modal"
            aria-hidden="true"
            style={showCallModal}
          >
            <div className="modal-dialog modal-dialog-scrollable modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  {/* <h5 className="modal-title"></h5> */}
                  <div className="close header_icon" data-bs-dismiss="modal" aria-label="Close" onClick={leaveCall}>
                    <Image src="/icons/x.svg" alt="Close" width={40} height={40} />
                  </div>
                  <div className="minimize header_icon" onClick={minimizeVideo}>
                    <Image src="/icons/dash.svg" alt="Minimize" width={40} height={40} />
                  </div>
                </div>
                <div className="modal-body">
                  {placeholder && (
                    <div className="placeholder_video d-flex justify-content-center w-100 h-100">
                      <div className="spinner-border text-primary m-auto" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                  <div className="local_video">
                    <video autoPlay={true} id="local_video" ref={myVideo} muted={true} />
                  </div>
                  <div className="remote_video">
                    <video id="remote_video" playsInline ref={userVideo} autoPlay />
                  </div>
                  {recording && (
                    <div className="recording">
                      <div className="rec_icon">
                        <Image src="/icons/stop-circle.svg" alt="Stop" width={20} height={20} />
                      </div>
                      <div className="rec_icon">
                        <Image src="/icons/pause-circle.svg" alt="Pause" width={20} height={20} />
                      </div>
                      <div className="rec_icon">
                        <Image src="/icons/play-circle.svg" alt="Pause" width={20} height={20} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <div className="video_icon record">
                    <Image src="/icons/record-circle.svg" alt="Record" width={20} height={20} />
                  </div>
                  <div className="video_icon camera" onClick={toggleVideo}>
                    <Image src="/icons/camera-video-off.svg" alt="Camera" width={20} height={20} />
                  </div>
                  <div className="video_icon call" onClick={leaveCall}>
                    <Image src="/icons/telephone-x.svg" alt="Call" width={35} height={35} />
                  </div>
                  <div className="video_icon shareScreen">
                    <Image src="/icons/pc-share.svg" alt="Mic" width={20} height={20} />
                  </div>
                  <div className="video_icon mic" onClick={toggleAudio}>
                    <Image src="/icons/mic-mute.svg" alt="Mic" width={20} height={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {videoBtn && (
            <div className="video_call_maximize" onClick={maximizeVideo}>
              <div className="video_call_btn">
                <Image src="/icons/camera-video-fill.svg" alt="Mic" width={45} height={45} />
              </div>
            </div>
          )}
        </>
      </CSSTransition>
    );
  };
  // const showVideo = useMemo(() => {
  //   return (
  //     <Video
  //       socket={socket}
  //       user={user}
  //       enterModal={enterModal}
  //       setEnterModal={setEnterModal}
  //       inOrOutCall={inOrOutCall}
  //       callerUserName={callerUserName}
  //       acceptCallHandler={acceptCallHandler}
  //       rejectCallHandler={rejectCallHandler}
  //       preOfferAnswer={preOfferAnswer}
  //       connectedUserDetail={connectedUserDetail}
  //       localStream={localStream}
  //       remoteStream={remoteStream}
  //       setLocalStream={setLocalStream}
  //       answerCall={answerCall}
  //     />
  //   );
  // }, [enterModal, user, inOrOutCall, connectedUserDetail, preOfferAnswer, acceptCallHandler, rejectCallHandler]);
  return (
    <Layout title="چت" user={user} socket={socket}>
      {/* {ShowVideo} */} <ShowVideo />
      <div className="container-fluid chat_wrapper">
        <div className="row mt-5 g-4">
          {receiverUser.username && (
            <div className="col-12 text-center receiver_username">
              <h4>{receiverUser.username}</h4>
              <div className="video_call_wrapper">
                <div
                  className="video_call_btn"
                  onClick={() => {
                    callUser(receiverUser.ID);
                  }}
                >
                  <Image src="/icons/video-call-fill.svg" alt="Mic" width={28} height={28} />
                </div>
                <div
                  className="audio_call_btn"
                  onClick={() => {
                    callUser(receiverUser.ID);
                  }}
                >
                  <Image src="/icons/telephone-outbound-fill.svg" alt="Mic" width={25} height={25} />
                </div>
              </div>
            </div>
          )}
          <div className="col-4 col-md-4 col-lg-3 border-start border_color min_h justify-content-center pt-2 users">{showUsers}</div>
          <div className="col-8 col-md-8 col-lg-9 border_color min_h messages" id="messages_wrapper">
            <Element name="messages_wrapper">
              {receiverUser.username && (
                <div className="dot_menu_wrapper">
                  <Image
                    src="/icons/three-dots.svg"
                    alt="Menu"
                    width={30}
                    height={30}
                    className="btn btn-sm dropdown-toggle"
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
                  <div className="message_buttons">
                    <a className="send_btn" title="ارسال" onClick={sendMessage}>
                      <Image src="/icons/send.svg" alt="Send Button" width={35} height={35} />
                    </a>
                    {showEmoji}
                  </div>
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
export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (ctx: GetServerSidePropsContext, user) => {
  const { token } = nextCookies(ctx);
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
  const u = res && res.users ? res.users.filter((u: User) => u.username !== user?.username) : [];
  const props = { user: user, token: token, users: u };
  return { props: { props } };
});