import Head from "next/head";
import type { AppProps } from "next/app";
import Router from "next/router";
import NProgress from "nprogress";
import SocketIoProvider from "../contexts/SocketIoContext";
import { ReceiverProvider } from "./../contexts/ReceiverContext";
import { UserProvider } from "./../contexts/UserContext";
import "../styles/main.scss";
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
      </Head>
      <SocketIoProvider>
        <UserProvider>
          <ReceiverProvider>
            <Component {...pageProps} />
          </ReceiverProvider>
        </UserProvider>
      </SocketIoProvider>
    </>
  );
}
export default MyApp;