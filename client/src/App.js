import React, { useState } from "react";
import Login from "./components/Login";
import ChatPage from "./components/ChatPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import socket from "./services/socket";

const App = () => {
  const [userName, setUserName] = useState(undefined);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login socket={socket} setUserName={setUserName} />}
        />
        <Route
          element={<ChatPage socket={socket} userName={userName} />}
          path="/chat"
        />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
