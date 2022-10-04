import React, { useEffect, useState } from "react";
// import socket from "../services/socket";
import "../styles/UsersList.css";
const UsersList = ({
  socket,
  userName,
  room,
  isPublic,
  setRoom,
  setIsPublic,
  setIsJoined,
}) => {
  const [roomUsers, setRoomUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  useEffect(() => {
    if (isPublic) socket.emit("getAllUsers");
  }, [room]);
  useEffect(() => {
    const chatUsersListener = (users, roomName) => {
      // console.log(users);
      if (roomName === room) setRoomUsers(users.map(({rooms,...user})=>user));
    };
    const newMessageListener = (message) => {
      // console.log(message);
      if (!message.isPublic) {
        setChatUsers((prevState) => {
          const sender = prevState.find((user) => user.id === message.senderId);
          if (sender) {
            return prevState.map((chatUser) =>
              chatUser.id === sender.id
                ? { ...chatUser, messageCnt: chatUser.messageCnt + 1 }
                : chatUser
            );
          } else {
            const senderSerialized = JSON.stringify(
              roomUsers.find((user) => user.id === message.senderId)
            );
            const newSender = JSON.parse(senderSerialized);

            newSender.messageCnt = 1;
            return [...prevState, newSender];
          }
        });
      }
    };
    const disconnectListener = ()=>{
     setChatUsers(chatUsers.filter(chatUser=>chatUser.id !== socket.id));
    };
    socket.on("chatUsers", chatUsersListener);
    socket.on("newMessage", newMessageListener);
    socket.on('disconnect',disconnectListener);

    return () => {
      socket.off("chatUsers", chatUsersListener);
      socket.off("newMessage", newMessageListener);
      socket.off('disconnect',disconnectListener);
    };
  }, []);

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
                onClick={() => {
                  if (
                    user.userName !== userName &&
                    !chatUsers.find(
                      ({ userName }) => userName === user.userName
                    )
                  ) {
                    setChatUsers((prevState) => [
                      ...prevState,
                      { ...user, messageCnt: 0, isActive: false },
                    ]);
                  } else {
                    setChatUsers((prevState) =>
                      prevState.map((chatUser) =>
                        chatUser.id === user.id
                          ? { ...chatUser, isActive: true }
                          : { ...chatUser, isActive: false }
                      )
                    );
                  }
                }}
              >
                <p>{user.userName}</p>
              </div>
            );
          })}
        </div>
      </div>
      {Boolean(chatUsers.length) && (
        <div className="chats-div">
          <div className="text-center">On Going Chats</div>
          <div className="list-group">
            {chatUsers.map((user, id) => {
              return (
                <div
                  key={id}
                  className={
                    "list-group-item d-flex justify-content-between align-items-center" +
                    (user.isActive ? " active" : "")
                  }
                >
                  <p
                    onClick={() => {
                      setChatUser((prevState) =>
                        prevState.map((chatUser) => ({
                          ...chatUser,
                          isActive: user.id === chatUser.id,
                        }))
                      );
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
                      setChatUsers((prevState) =>
                        prevState.filter(({ id }) => id !== user.id)
                      )
                    }
                  >
                    Close Chat
                  </button>
                  {Boolean(user.messageCnt) && (
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
