import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import ChatPage from "./components/ChatPage";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);
const App = () => {
  const [userName, setUserName] = useState(undefined);

  if (!userName) return <Login socket={socket} setUserName={setUserName} />;
  else return <ChatPage socket={socket} userName={userName} />;
};
export default App;
