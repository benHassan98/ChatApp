import React, { useState } from "react";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";

const App = () => {
  const socket = io(process.env.REACT_APP_API_URL);
  const [userName, setUserName] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Login socket={socket} setUserName={setUserName} />}
        />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
