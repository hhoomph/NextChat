/* eslint-disable react-hooks/exhaustive-deps */
import "webrtc-adapter";
import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import Image from "next/image";
// import jsCookie from "js-cookie";
import { User, Constraints, ConnectedUserDetail } from "../types/Types";
import { Socket } from "socket.io-client";
import { useReceiver } from "./../contexts/ReceiverContext";
// let pc: RTCPeerConnection;
type Props = {
  socket: Socket;
  user?: User;
  enterModal: boolean;
  setEnterModal: (enterModal: boolean) => void;
  inOrOutCall: string;
  setInOrOutCall?: (enterModal: boolean) => void;
  callerUserName?: string;
  acceptCallHandler: () => void;
  rejectCallHandler: () => void;
  preOfferAnswer: string;
  connectedUserDetail: ConnectedUserDetail;
  pc: any;
};
const Video = ({
  socket,
  enterModal,
  setEnterModal,
  inOrOutCall,
  callerUserName,
  acceptCallHandler,
  rejectCallHandler,
  preOfferAnswer,
  connectedUserDetail,
  pc,
}: Props) => {
  // const token = jsCookie.get("token");
  // const username = user?.username;
  const { receiverUser } = useReceiver();
  const [constraints] = useState<Constraints>({
    audio: true,
    video: {
      width: 300,
      height: 220,
    },
    aspectRatio: 1.7777777778,
    echoCancellation: true,
    // width: { min: 640, max: 640 },
    // height: { min: 480, max: 480 },
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  // const [screenSharingStream, setScreenSharingStream] = useState<MediaStream | null>(null);
  // const [isMuted, setIsMuted] = useState<boolean>(false);
  // const [screenShareActive, setScreenShareActive] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  // let isFirefox = false;
  // if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
  //   const sUsrAg = navigator.userAgent;
  //   isFirefox = sUsrAg.indexOf("Firefox") > -1 ? true : false;
  // }
  //  Peer Connection
  // let pc: RTCPeerConnection;
  const peerConfiguration: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    // iceServers: [{ urls: "stun:stun01.sipphone.com" }, { urls: "stun:stun.ekiga.net" }],
    // iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun.1.google.com:13902" }],
  };
  const creatPeerConnection = () => {
    let p = new RTCPeerConnection(peerConfiguration);
    pc.current = p;
    // setPeerConnection(pc);
    p.onicecandidate = (event: any) => {
      if (event.candidate) {
        console.log("onicecandidate");
        // send our candidate to other peer
        sendDataUsingWebRTCSignaling({
          connectedUserSocketId: connectedUserDetail.socketId,
          type: "ICE_CANDIDATE",
          candidate: event.candidate,
        });
      }
    };
    p.onconnectionstatechange = (event: any) => {
      console.log(p.connectionState);
      if (p.connectionState === "connected") {
        console.log("successfully connected with other peer", event);
      }
    };
    p.oniceconnectionstatechange = (e: any) => {
      console.log(e);
    };
    // Receiving Track
    const remoteStreamFromPeer = new MediaStream();
    setRemoteStream(remoteStreamFromPeer);
    p.ontrack = (event: any) => {
      remoteStream?.addTrack(event.track);
      setRemoteStream(event.streams[0]);
    };
    let remoteVideo = remoteVideoRef.current;
    if (remoteVideo) {
      remoteVideo.srcObject = remoteStreamFromPeer;
    }
    remoteVideo?.play().catch((e) => {
      console.log(e);
    });
    // Add our Stream to peer connection
    if ((connectedUserDetail.callType === "VIDEO_PERSONAL_CODE" || connectedUserDetail.callType === "AUDIO_PERSONAL_CODE") && localStream) {
      for (const track of localStream.getTracks()) {
        p.addTrack(track, localStream);
      }
    } else {
      console.log("no local stream");
    }
  };
  // useEffect(() => {
  //  creatPeerConnection();
  // }, []);
  // Main Video Modal
  const [modal, setModal] = useState<boolean>(false);
  const toggleModal = () => {
    setModal(!modal);
  };
  const showModal = modal ? { display: "block", transition: "all 250ms ease-in-out" } : { display: "none", transition: "all 250ms ease-in-out" };
  const modalRef = React.useRef(null);
  // Entering Modal
  // const toggleEnterModal = () => {
  //   setEnterModal(!enterModal);
  // };
  const showEnterModal = enterModal ? { display: "block", transition: "all 250ms ease-in-out" } : { display: "none", transition: "all 250ms ease-in-out" };
  // const enterModalRef = React.useRef(null);
  const [videoBtn, setVideoBtn] = useState<boolean>(false);
  const minimizeVideo = () => {
    setModal(false);
    setVideoBtn(true);
  };
  const maximizeVideo = () => {
    setVideoBtn(false);
    setModal(true);
  };
  const [placeholder, setPlaceholder] = useState<boolean>(true);
  // const togglePlaceholder = () => {
  //   setPlaceholder(!placeholder);
  // };
  const getLocalPrevie = () => {
    setPlaceholder(false);
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        setLocalStream(stream);
        let video = localVideoRef.current;
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
  useEffect(() => {
    let video = localVideoRef.current;
    video?.addEventListener("loadedmetadata", () => {
      video?.play().catch((e) => {
        console.log(e);
      });
    });
    let remoteVideo = remoteVideoRef.current;
    remoteVideo?.addEventListener("loadedmetadata", () => {
      remoteVideo?.play().catch((e) => {
        console.log(e);
      });
    });
  }, []);
  useEffect(() => {
    let remoteVideo = remoteVideoRef.current;
    remoteVideo?.addEventListener("loadedmetadata", () => {
      remoteVideo?.play().catch((e) => {
        console.log(e);
      });
    });
    if (remoteStream) {
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream;
        remoteVideo.play().catch((e) => {
          console.log(e);
        });
      }
    }
  }, [remoteStream]);
  useEffect(() => {
    if (preOfferAnswer === "CALL_ACCEPTED" && connectedUserDetail.socketId !== null && inOrOutCall == "OutcomingCall") {
      const sendWebRTCOffer = async () => {
        console.log("firstPc:", pc.current);
        const offer = await pc.current?.createOffer();
        await pc.current?.setLocalDescription(new RTCSessionDescription(offer));
        sendDataUsingWebRTCSignaling({
          connectedUserSocketId: connectedUserDetail.socketId,
          type: "OFFER",
          offer: offer,
        });
      };
      getLocalPrevie();
      creatPeerConnection();
      setEnterModal(false);
      setModal(true);
      acceptCallHandler();
      sendWebRTCOffer();
    }
  }, [preOfferAnswer, connectedUserDetail]);
  const sendDataUsingWebRTCSignaling = (data: any) => {
    socket.emit("webRTC-signaling", data);
  };
  useEffect(() => {
    const handleWebRTCOffer = async (data: any) => {
      console.log("SeconPc:", pc.current);
      await pc.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(new RTCSessionDescription(answer));
      sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetail.socketId,
        type: "ANSWER",
        answer: answer,
      });
    };
    const handleWebRTCAnswer = async (data: any) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log("answered");
    };
    const handleWebRTCCandidate = async (data: any) => {
      try {
        await pc.current?.addIceCandidate(data.candidate);
        console.log("get candidate ");
      } catch (error) {
        console.log("error occurred when trying to add receiving ice candidate", error);
      }
    };
    if (connectedUserDetail.socketId && connectedUserDetail.socketId !== null) {
      socket.on("webRTC-signaling", (data) => {
        switch (data.type) {
          case "OFFER":
            handleWebRTCOffer(data);
            break;
          case "ANSWER":
            handleWebRTCAnswer(data);
            break;
          case "ICE_CANDIDATE":
            handleWebRTCCandidate(data);
            break;
          default:
            break;
        }
      });
    }
    if (socket?.connected) {
      return () => {
        socket.off("webRTC-signaling");
      };
    }
  }, [connectedUserDetail, socket, preOfferAnswer]);
  // const sendWebRTCOffer = async () => {
  //   const offer = await pc.current?.createOffer();
  //   await pc.current?.setLocalDescription(new RTCSessionDescription(offer));
  //   sendDataUsingWebRTCSignaling({
  //     connectedUserSocketId: connectedUserDetail.socketId,
  //     type: "OFFER",
  //     offer: offer,
  //   });
  // };
  const acceptCall = () => {
    getLocalPrevie();
    creatPeerConnection();
    setEnterModal(false);
    setModal(true);
    acceptCallHandler();
    // sendWebRTCOffer();
  };
  const rejectCall = () => {
    setEnterModal(false);
    setModal(false);
    rejectCallHandler();
  };
  const [recording] = useState<boolean>(true);
  // const [recording, setRecording] = useState<boolean>(true);
  // const toggleRecording = () => {
  //   setRecording(!recording);
  // };
  return (
    <CSSTransition timeout={300} appear={true} classNames="fade" in={modal} nodeRef={modalRef}>
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
                  <div className="usr_name">{receiverUser.username ? receiverUser.username : callerUserName}</div>
                  {preOfferAnswer !== "" && preOfferAnswer !== "CALL_ACCEPTED" && <div className="call_info">{preOfferAnswer}</div>}
                </div>
              </div>
              <div className="modal-footer text-center">
                <div className="video_icon call_cancel" onClick={rejectCall}>
                  <Image src="/icons/telephone-x-red.svg" alt="Cancel Call" width={35} height={35} />
                </div>
                {inOrOutCall === "IncomingCall" && (
                  <div className="video_icon call_accept" onClick={acceptCall}>
                    <Image src="/icons/telephone-inbound.svg" alt="Accept Call" width={35} height={35} />
                  </div>
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
          style={showModal}
        >
          <div className="modal-dialog modal-dialog-scrollable modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                {/* <h5 className="modal-title"></h5> */}
                <div className="close header_icon" data-bs-dismiss="modal" aria-label="Close" onClick={toggleModal}>
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
                  <video autoPlay={true} id="local_video" ref={localVideoRef} muted={true} />
                </div>
                <div className="remote_video">
                  <video autoPlay={true} id="remote_video" ref={remoteVideoRef} />
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
                <div className="video_icon camera">
                  <Image src="/icons/camera-video-off.svg" alt="Camera" width={20} height={20} />
                </div>
                <div className="video_icon call">
                  <Image src="/icons/telephone-x.svg" alt="Call" width={35} height={35} />
                </div>
                <div className="video_icon shareScreen">
                  <Image src="/icons/pc-share.svg" alt="Mic" width={20} height={20} />
                </div>
                <div className="video_icon mic">
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
export default Video;