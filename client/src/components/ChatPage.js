import React, { useState } from "react";
import "../styles/ChatPage.css";
const ChatPage = ({socket, userName }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [room, setRoom] = useState("Public");
  const [isJoined,setIsJoined] = useState(true);




};

export default ChatPage;
