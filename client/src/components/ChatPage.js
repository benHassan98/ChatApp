import { useEffect, useState } from "react";
import UsersList from "./UsersList";
import Board from "./Board";
import RoomsList from "./RoomsList";
import "../styles/ChatPage.css";
const ChatPage = ({ socket, userName }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [room, setRoom] = useState("Public");
  const [isJoined, setIsJoined] = useState(true);

  useEffect(()=>{
    socket.emit("newUser", userName, 'Public');
  },[]);
  return (
    <>
      <UsersList
        socket={socket}
        userName={userName}
        room={room}
        setRoom={setRoom}
        setIsPublic={setIsPublic}
        setIsJoined={setIsJoined}
      />
      <Board
        socket={socket}
        userName={userName}
        room={room}
        isPublic={isPublic}
        isJoined={isJoined}
      />
      <RoomsList
        socket={socket}
        room={room}
        setIsJoined={setIsJoined}
        setRoom={setRoom}
        setIsPublic={setIsPublic}
      />
    </>
  );
};

export default ChatPage;
