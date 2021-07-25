import React, { useState, useContext, createContext } from "react";
import { User } from "../types/Types";
// const ReceiverDispatchContext = createContext<User>({} as User);
// export interface Action {
//   type: string;
//   [key: string]: any;
// }
// const reducer = (state: User, action: Action) => {
//   switch (action.type) {
//     case "INCREASE":
//       return state + 1;
//     case "DECREASE":
//       return state - 1;
//     case "INCREASE_BY":
//       return state + action.payload;
//     default:
//       throw new Error(`Unknown action: ${action.type}`);
//   }
// };
// export const CounterProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(reducer, 0)
//   return (
//     <ReceiverDispatchContext.Provider value={dispatch}>
//       <ReceiverContext.Provider value={state}>
//         {children}
//       </ReceiverContext.Provider>
//     </ReceiverDispatchContext.Provider>
//   )
// }
// export const useCount = () => useContext(ReceiverContext)
// export const useDispatchCount = () => useContext(ReceiverDispatchContext)
type ReceiveContextState = {
  receiverUser: User;
  setReceiverUser: (user: User) => void;
};
const contextDefaultValues: ReceiveContextState = {
  receiverUser: {
    _id: "",
    username: "",
    createdAt: 0,
  },
  setReceiverUser: (contextDefaultValues) => {contextDefaultValues},
};
export const ReceiverContext = createContext<ReceiveContextState>(contextDefaultValues);
type ReceiverProviderProps = {
  children: React.ReactNode;
};
// type ReceiverProviderProps = React.PropsWithChildren<{}>;
export const useReceiver = () => useContext<ReceiveContextState>(ReceiverContext);
export const ReceiverProvider = ({ children }: ReceiverProviderProps) => {
  const [receiverUser, setReceiverUser] = useState<User>(contextDefaultValues.receiverUser);
  return (
    <ReceiverContext.Provider
      value={{
        receiverUser,
        setReceiverUser,
      }}
    >
      {children}
    </ReceiverContext.Provider>
  );
};