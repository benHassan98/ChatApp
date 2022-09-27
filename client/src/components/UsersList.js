import React, { useEffect, useState, useRef } from "react";
// import socket from "../services/socket";
import "../styles/UsersList.css";
const UsersList = ({socket,  userName, setRoom, setIsPublic, setIsJoined }) => {
  const [roomUsers, setRoomUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
 
  useEffect(() => {
    const chatUsersListener = (users) => {
      setRoomUsers(users);
    };
    const newMessageListener = (message) => {
      if (!message.isPublic) {
        const sender = chatUsers.find((user) => user.id === message.senderId);
        if (sender) {
          sender.messageCnt++;
        } else {
          const senderSerialized = JSON.stringify(
            roomUsers.find((user) => user.id === message.senderId)
          );
          const newSender = JSON.parse(senderSerialized);

          newSender.messageCnt = 1;
          newSender.ref = useRef();
          setChatUsers([...chatUsers, newSender]);
        }
      }
    };
    socket.on("chatUsers", chatUsersListener);
    socket.on("newMessage", newMessageListener);

    return () => {
      socket.off("chatUsers", chatUsersListener);
      socket.off("newMessage", newMessageListener);
    };
  }, [socket]);

  return (
    <div className="users-list">
      <div className="active-div">
        <div className="text-center">Active Users</div>
        <div className="list-group">
          {roomUsers.map((user, id) => {
            return (
              <div
                className={
                  "list-group-item d-flex justify-content-between align-items-center list-group-item-action"
                }
                key={id}
              >
                <p
                  onDoubleClick={() => {
                    if (user.userName !== userName)
                      setChatUsers([
                        ...chatUsers,
                        { ...user, messageCnt: 0, ref: useRef() },
                      ]);
                  }}
                >
                  {user.userName}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      {chatUsers.length && (
        <div className="chats-div">
          <div className="text-center">On Going Chats</div>
          <div className="list-group">
            {chatUsers.map((user, id) => {
              return (
                <div
                  key={id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  ref={user.ref}
                >
                  <p
                    onClick={() => {
                      chatUsers.forEach(({ ref }) =>
                        ref.current.classList.remove("active")
                      );
                      user.ref.classList.add("active");
                      setRoom(user.id);
                      setIsPublic(false);
                      setIsJoined(true);
                    }}
                  >
                    {user.userName}
                  </p>

                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{
                      "--bs-btn-padding-y": ".25rem",
                      "--bs-btn-padding-x": ".5rem",
                      "--bs-btn-font-size": ".75rem",
                    }}
                    onClick={() =>
                      setChatUsers(
                        chatUsers.filter(
                          ({ userName }) => userName === user.userName
                        )
                      )
                    }
                  >
                    Close Chat
                  </button>
                  {user.messageCnt && (
                    <span className="badge bg-danger rounded-pill">
                      {user.messageCnt}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
