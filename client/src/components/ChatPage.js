import { useEffect, useState } from "react";
import UsersList from "./UsersList";
import Board from "./Board";
import RoomsList from "./RoomsList";
import "../styles/ChatPage.css";
const ChatPage = ({ socket, userName }) => {
  const [room, setRoom] = useState("Public");
  const [isPublic, setIsPublic] = useState(true);
  const [isJoined, setIsJoined] = useState(true);
  const [receiverId,setReceiverId] = useState(null);

  useEffect(()=>{
    socket.emit("newUser", userName, 'Public');
    socket.emit("getMessages", room, isPublic);
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
        setReceiverId={setReceiverId}
      />
      <Board
        socket={socket}
        userName={userName}
        room={room}
        isPublic={isPublic}
        isJoined={isJoined}
        receiverId={receiverId}
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
