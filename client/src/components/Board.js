import React, { useEffect, useRef, useState } from "react";
// import socket from "../services/socket";
import "../styles/Board.css";
const Board = ({socket,  room, isPublic, isJoined }) => {
  const [messages, setMessages] = useState([]);
  const textAreaRef = useRef();
  const bottomRef = useRef();
  useEffect(() => {
    socket.emit("getMessages", room, isPublic);
  }, [room]);
  useEffect(() => {
    const getMessageListener = (receivedMessages) => {
      setMessages(receivedMessages);
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    };
    const newMessageListener = (message) => {
      setMessages([...messages, message]);
    };
    socket.on("getMessages", getMessageListener);
    socket.on("newMessage", newMessageListener);

    return () => {
      socket.off("getMessages", getMessageListener);
      socket.off("newMessage", newMessageListener);
    };
  }, [socket]);

  return (
    <div className="board">
      <div className="messages">
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
              <p>{message.content}</p>
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
        ></textarea>
        <label htmlFor="floatingTextarea">Message...</label>
        <button
          className="btn btn-primary"
          disabled={isJoined}
          onClick={() => {
            if (textAreaRef.current.value !== "") {
              const message = {
                senderId: socket.id,
                room,
                isPublic,
                content: textAreaRef.current.value,
              };
              if (!isPublic) message.reveiverId = room;
              setMessages([...messages, message]);
              socket.emit("newMessage", room, message);
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
