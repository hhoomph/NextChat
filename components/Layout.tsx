import React, { ReactNode, useState } from "react";
import ActiveLink from "./ActiveLink";
import Head from "next/head";
import Image from "next/image";
import { logout } from "../utils/auth";
// import { useRouter } from "next/router";
// import fetchData from "../utils/fetchData";
// import jsCookie from "js-cookie";
import { User } from "../types/Types";
import Search from "./Search";
import { CSSTransition } from "react-transition-group";
// import { useSocketIo } from "../contexts/SocketIoContext";
//  import { useSocket } from "../contexts/SocketContext";
 import {  Socket } from "socket.io-client";
import { useUser } from "../contexts/UserContext";
// import jsCookie from "js-cookie";
// const token = jsCookie.get("token");
// const port = parseInt(process.env.PORT || "3000", 10);
// const baseUrl = process.env.NODE_ENV !== "production" ? "http://localhost:" + port : "https://next-chat-beta-five.vercel.app".replace(/^http/, "ws");
type Props = {
  children?: ReactNode;
  title?: string;
  user?: User;
  socket?: Socket;
};
const Layout = ({ children, title = "Next Chat", user, socket }: Props) => {
  const { currentUser, setCurrentUser } = useUser();
  const userName = currentUser && currentUser.username ? currentUser.username : user?.username !== undefined ? user.username : false;
  const [menu, setMenu] = useState<boolean>(false);
  const toggleMenu = () => {
    setMenu(!menu);
  };
  const showMenu = menu ? " show " : "";
  const setRightMenu = menu ? " pe-3 " : "";
  const nodeRef = React.useRef(null);
  // const router = useRouter();
  const copyRightDate = new Date().getFullYear();
  // const socket = useSocketIo();
  // const [socket] = useSocket();
  // const socket = useContext(SocketContext);
  // const iniSocket = socketIo(baseUrl, {
  //   withCredentials: true,
  //   query: token ? { token } : undefined,
  //   autoConnect: false,
  //   multiplex: false,
  //   transports: ["websocket"],
  //   upgrade: false,
  //   jsonp: false,
  //   reconnection: true,
  //   reconnectionDelay: 500,
  // });
  // const [socket, _] = useState<Socket>(iniSocket);
  // useEffect(() => {
  //   socket.open();
  //   socket.connect();
  //   socket.io.open();
  //   socket.io.connect();
  //   socket.emit("initUser");
  //   setSocket(socket);
  //   if (socket.connected) {
  //     return () => {
  //       socket.close();
  //       socket.disconnect();
  //     };
  //   }
  // }, [socket]);
  const handleLogout = React.useCallback(() => {
    if (socket?.connected) {
      socket?.close();
      socket?.disconnect();
    }
    logout();
    setCurrentUser(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="container-fluid min-vh-100">
      {/* <Script src="../node_modules/bootstrap/dist/js/bootstrap.min.js"></Script> */}
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header>
        <nav className="navbar navbar-expand-md navbar-light bg-light">
          <div className="container-fluid">
            <ActiveLink href="/">
              <a className="navbar-brand">
                <Image src="/static/SvgIcons/house-door.svg" alt="Chat Application" width={30} height={30} />
              </a>
            </ActiveLink>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarText"
              aria-controls="navbarText"
              aria-expanded="false"
              aria-label="Toggle navigation"
              onClick={toggleMenu}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <CSSTransition timeout={300} classNames="fade_menu" in={menu} nodeRef={nodeRef}>
              <div className={"collapse navbar-collapse justify-content-between" + showMenu} id="navbarText" ref={nodeRef}>
                <ul className={"navbar-nav mb-2 mb-lg-0" + setRightMenu}>
                  {/* <li className="nav-item">
                <ActiveLink href="/">
                  <a className="nav-link" aria-current="page" href="#">
                    Home
                  </a>
                </ActiveLink>
              </li> */}
                  {userName && (
                    <li className="nav-item">
                      <ActiveLink href="/chat">
                        <a className="nav-link" aria-current="page" href="#">
                          {userName}
                        </a>
                      </ActiveLink>
                    </li>
                  )}
                  {!userName && (
                    <>
                      <li className="nav-item">
                        <ActiveLink href="/register">
                          <a className="nav-link" aria-current="page" href="#">
                            ثبت نام
                          </a>
                        </ActiveLink>
                      </li>
                      <li className="nav-item">
                        <ActiveLink href="/login">
                          <a className="nav-link" aria-current="page" href="#">
                            ورود
                          </a>
                        </ActiveLink>
                      </li>
                    </>
                  )}
                  <li className="nav-item">
                    <ActiveLink href="/about">
                      <a className="nav-link" aria-current="page" href="#">
                        درباره ما
                      </a>
                    </ActiveLink>
                  </li>
                  {userName && (
                    <li className="nav-item" style={{ cursor: "pointer" }}>
                      <a className="nav-link" aria-current="page" style={{ color: "#e91e63" }} onClick={handleLogout}>
                        خروج
                      </a>
                    </li>
                  )}
                </ul>
                <Search user={user} />
              </div>
            </CSSTransition>
          </div>
        </nav>
      </header>
      {children}
      <footer className="text-center footerColor2">
        <hr />
        <p>
          Copyright &copy; {copyRightDate}
          <a className="footerColor" href="mailto:hh.oomph@gmail.com">
            {" "}
            H.H{" "}
          </a>
          All Rights Reserved
        </p>
      </footer>
    </div>
  );
};
export default Layout;