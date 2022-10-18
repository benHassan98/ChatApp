import React, { useEffect, useRef, useState } from "react";
import "../styles/Board.css";
const Board = ({
  socket,
  userName,
  publicRoom,
  privateRoom,
  isJoined,
  receiverId,
}) => {
  const [messages, setMessages] = useState([]);
  const [isDisconnected, setIsDisconnected] = useState(null);
  const textAreaRef = useRef();
  const bottomRef = useRef();
  const stats = (() => {
    if (privateRoom) {
      return {
        roomName: privateRoom,
        isPublic: false,
      };
    } else {
      return {
        roomName: publicRoom,
        isPublic: true,
      };
    }
  })();
  useEffect(() => {
    // console.log("change", publicRoom, privateRoom);
    setIsDisconnected(false);
    const getMessageListener = (receivedMessages) => {
      setMessages(receivedMessages);
    };
    const newMessageListener = (message) => {
      if (message.isDisconnected && message.userId === receiverId) {
        setIsDisconnected(true);
      }
      if (stats.roomName === message.room)
        setMessages((prevState) => [...prevState, message]);
    };
    socket.on("getMessages", getMessageListener);
    socket.on("newMessage", newMessageListener);
    socket.emit("getMessages", stats.roomName, stats.isPublic, receiverId);
    return () => {
      socket.off("getMessages", getMessageListener);
      socket.off("newMessage", newMessageListener);
    };
  }, [publicRoom, privateRoom]);
  useEffect(() => {
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="board">
      <div className="messages" data-testid='messages'>
        {messages.map((message, id) => {
          return (
            <div
              className={
                "text-center bg-dark text-white" +
                (message.senderId === "ChatBot"
                  ? " p1"
                  : message.senderId === socket.id
                  ? " p2"
                  : " p3")
              }
              key={id}
            >
              <p>
                {(message.senderId !== "ChatBot" &&
                message.senderName !== userName &&
                message.isPublic
                  ? message.senderName + ":"
                  : "") + message.content}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="message-input form-floating">
        <textarea
          className="form-control"
          placeholder="Leave a message here"
          id="floatingTextarea"
          style={{ height: "70px" }}
          ref={textAreaRef}
          data-testid='text-area'
        ></textarea>
        <label htmlFor="floatingTextarea">
          {isDisconnected ? "User is Disconnected" : "Message..."}
        </label>
        <button
          className="btn btn-primary"
          disabled={!isJoined || isDisconnected}
          onClick={() => {
            if (textAreaRef.current.value !== "") {
              const message = {
                senderId: socket.id,
                senderName: userName,
                room: stats.roomName,
                isPublic: stats.isPublic,
                content: textAreaRef.current.value,
              };
              if (!stats.isPublic) message.receiverId = receiverId;
              setMessages((prevState) => [...prevState, message]);
              socket.emit("newMessage", message);
              textAreaRef.current.value = "";
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Board;
