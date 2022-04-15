import { createContext } from "react";
import io from "socket.io-client";

import { User } from "./types";

interface AuthCallback {
  setLoggedIn: (x: boolean) => void;
}

interface Shared {
  authContext: React.Context<AuthCallback>;
  socket: SocketIOClient.Socket;
  currentUser?: User;
  tickRate: number;
}

let shared: Shared = {
  authContext: createContext<AuthCallback>({ setLoggedIn: () => {} }),
  socket: io("http://ec2-18-188-87-120.us-east-2.compute.amazonaws.com:3000", {
    forceNode: true,
  } as any),
  tickRate: 300,
};

export default shared;
