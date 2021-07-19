import React, { useEffect, ReactNode } from "react";
import { NextPage, NextPageContext } from "next";
import jsCookie from "js-cookie";
import Router from "next/router";
import nextCookies from "next-cookies";
import jwt from "jsonwebtoken";
import { User } from "../types/Types";
const SECRET = process.env.SECRET;
type Props = {
  children?: ReactNode;
  user?: User;
};
/*
 * @params {jwtToken} extracted from cookies
 * @return {object} object of extracted token
 */
export function verifyToken(jwtToken: string | any): any {
  try {
    return jwt.verify(jwtToken, SECRET);
  } catch (e) {
    console.log(e);
    logout();
  }
}
export const login = (token: string, remember: boolean) => {
  remember
    ? jsCookie.set("token", token, {
        expires: 14,
        secure: process.env.NODE_ENV === "production" ? true : false,
      })
    : jsCookie.set("token", token, {
        secure: process.env.NODE_ENV === "production" ? true : false,
      });
  Router.push("/chat");
};
export const logout = () => {
  jsCookie.remove("token");
  // Log out from all windows
  if (typeof window === "undefined") {
  } else {
    window.localStorage.setItem("logout", new Date().toLocaleDateString());
    Router.push("/login");
  }
};
export const auth = (ctx: NextPageContext) => {
  const { token } = nextCookies(ctx);
  const verify = token ? verifyToken(token.toString()) : false;
  if (!token || !verify) {
    if (typeof window === "undefined") {
      ctx.res?.writeHead(302, { Location: "/login" });
      ctx.res?.end();
      // return { redirect: { destination: "/login", permanent: false } };
      return {
        props: {}, // will be passed to the page component as props
      };
    } else {
      Router.push("/login");
    }
  }
  return token;
};
export const withAuthSync = (WrappedComponent: NextPage): NextPage => {
  const Wrapper = (props: Props) => {
    const syncLogout = (event: any) => {
      if (event.key === "logout") {
        Router.push("/login");
      }
    };
    useEffect(() => {
      window.addEventListener("storage", syncLogout);
      return () => {
        window.removeEventListener("storage", syncLogout);
        window.localStorage.removeItem("logout");
      };
    }, []);
    return <WrappedComponent {...props} />;
  };
  Wrapper.getInitialProps = async (ctx: NextPageContext) => {
    const token = auth(ctx);
    const profile = token ? verifyToken(token.toString()) : false;
    const user: User = (profile as any)?.user || undefined;
    const componentProps = WrappedComponent.getInitialProps && (await WrappedComponent.getInitialProps(ctx));
    return { ...componentProps, user };
  };
  return Wrapper;
};