import React, { useState, useContext, createContext } from "react";
import { User } from "../types/Types";
import jsCookie from "js-cookie";
import { verifyToken } from "../utils/auth";
const token = jsCookie.get("token");
type UserContextState = {
  currentUser: User | any;
  setCurrentUser: (user: User | any) => void;
};
let profile: any = false;
if (token) {
  profile = verifyToken(token.toString());
}
const contextDefaultValues: UserContextState = {
  currentUser: profile
    ? profile?.user
    : {
        _id: "",
        username: "",
        createdAt: 0,
      },
  setCurrentUser: (currentUser) => {currentUser},
};
export const UserContext = createContext<UserContextState>(contextDefaultValues);
type UserProviderProps = {
  children: React.ReactNode;
};
// type UserProviderProps = React.PropsWithChildren<{}>;
export const UserProvider = ({ children }: UserProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User>(contextDefaultValues.currentUser);
  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
export const useUser = () => useContext<UserContextState>(UserContext);