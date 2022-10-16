import { useEffect, useState } from "react";
import UsersList from "./UsersList";
import Board from "./Board";
import RoomsList from "./RoomsList";
import "../styles/ChatPage.css";
const ChatPage = ({ socket, userName }) => {
  const [publicRoom, setPublicRoom] = useState("Public");
  const [privateRoom,setPrivateRoom] = useState(null);
  const [isJoined, setIsJoined] = useState(true);
  const [receiverId,setReceiverId] = useState(null);
console.log('chatPage',publicRoom);
  useEffect(()=>{
    socket.emit("newUser", userName, publicRoom);
  },[]);
  return (
    <>
      <UsersList
        socket={socket}
        userName={userName}
        publicRoom={publicRoom}
        setPrivateRoom={setPrivateRoom}
        setIsJoined={setIsJoined}
        setReceiverId={setReceiverId}
      />
      <Board
        socket={socket}
        userName={userName}
        publicRoom={publicRoom}
        privateRoom={privateRoom}
        isJoined={isJoined}
        receiverId={receiverId}
      />
      <RoomsList
        socket={socket}
        privateRoom={privateRoom}
        setIsJoined={setIsJoined}
        setPublicRoom={setPublicRoom}
        setPrivateRoom={setPrivateRoom}
        setReceiverId={setReceiverId}
      />
    </>
  );
};

export default ChatPage;
