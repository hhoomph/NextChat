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
import { useSocketIo } from "../contexts/SocketIoContext";
// const token = jsCookie.get("token");
// import Script from "next/script";
type Props = {
  children?: ReactNode;
  title?: string;
  user?: User;
};
const Layout = ({ children, title = "This is the default title", user }: Props) => {
  const userName = user?.username || null;
  const [menu, setMenu] = useState<boolean>(false);
  const toggleMenu = () => {
    setMenu(!menu);
  };
  const showMenu = menu ? " show " : "";
  const setRightMenu = menu ? " pe-3 " : "";
  const nodeRef = React.useRef(null);
  // const router = useRouter();
  const copyRightDate = new Date().getFullYear();
  const socket = useSocketIo();
  const handleLogout = () => {
    socket.disconnect();
    logout();
  };
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
                      <a className="nav-link" aria-current="page" style={{ color: "#f57c00" }} onClick={handleLogout}>
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
          Copyright &copy; {copyRightDate}{" "}
          <a className="footerColor" href="mailto:hh.oomph@gmail.com">
            {" "}
            H.H{" "}
          </a>{" "}
          All Rights Reserved
        </p>
      </footer>
    </div>
  );
};
export default Layout;