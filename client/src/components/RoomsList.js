import React, { useEffect, useRef, useState } from "react";
import "../styles/RoomsList.css";
const RoomsList = ({ socket, setRoom, setIsJoined, setIsPublic }) => {
  const [rooms, setRooms] = useState([
    {
      name: "Public",
      isActive: true,
      isJoined: true,
      messageCnt: 0,
    },
  ]);
  const createRoomRef = useRef();
  const createRoominputRef = useRef();
  const createRoomErrorRef = useRef();
  const createNewRoom = (e) => {
    e.preventDefault();
    createRoominputRef.current.classList.remove("is-invalid");
    if (createRoominputRef.current.value === "") {
      createRoominputRef.current.classList.add("is-invalid");
      createRoomErrorRef.current.textContent = "Please enter a Room Name";
    } else if (createRoominputRef.current.value.length >= 30) {
      createRoominputRef.current.classList.add("is-invalid");
      createRoomErrorRef.current.textContent =
        "Room Name should be less than 30 chars";
    } else if (rooms.indexOf(createRoominputRef.current.value) !== -1) {
      createRoominputRef.current.classList.add("is-invalid");
      createRoomErrorRef.current.textContent = "Room Name already exists";
    } else {
      const newRoomName = createRoominputRef.current.value;
      createRoominputRef.current.value = "";
      setRoom(newRoomName);
      setIsPublic(true);
      setIsJoined(true);
      setRooms((prevState) => [
        ...prevState.map((room) => ({ ...room, isActive: false })),
        {
          name: newRoomName,
          isActive: true,
          isJoined: true,
          messageCnt: 0,
        },
      ]);
      socket.emit("joinRoom", newRoomName);
    }
  };

  useEffect(() => {
    socket.emit("getAllRooms");
    const getAllRoomsListener = (allRooms) => {
      setRooms((prevState) => {
        const newRooms = allRooms
          .filter(
            (roomName) =>
              !Boolean(prevState.find(({ name }) => roomName === name))
          )
          .map((roomName) => ({
            name: roomName,
            isActive: false,
            isJoined: false,
            messageCnt: 0,
          }));

        return [...prevState, ...newRooms];
      });
    };
    const newRoomsListener = (roomName) => {
      setRooms((prevState) => [
        ...prevState,
        { name: roomName, isActive: false, isJoined: false, messageCnt: 0 },
      ]);
    };
    const newMessageListener = (message) => {
      if (
        message.isPublic &&
        rooms.find((room) => room.name === message.room && room.isJoined)
      ) {
        setRooms((prevState) =>
          prevState.map((room) =>
            room.name === message.room && !room.isActive
              ? { ...room, messageCnt: room.messageCnt + 1 }
              : room
          )
        );
      }
    };
    socket.on("getAllRooms", getAllRoomsListener);
    socket.on("newRoom", newRoomsListener);
    socket.on("newMessage", newMessageListener);

    return () => {
      socket.off("getAllRooms", getAllRoomsListener);
      socket.off("newRoom", newRoomsListener);
      socket.off("newMessage", newMessageListener);
    };
  }, []);

  return (
    <div className="rooms">
      <button
        className="btn btn-light"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasRight"
        aria-controls="offcanvasRight"
      >
        Show Rooms
      </button>

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">
            Rooms
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div
          className="offcanvas-body"
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <div className="list-group">
            {rooms.map(({ name, isActive, isJoined, messageCnt }, id) => {
              return (
                <div
                  className={
                    "list-group-item d-flex justify-content-between align-items-center " +
                    (isActive ? "active" : "")
                  }
                  key={id}
                >
                  <p
                    onClick={() => {
                      setRooms((prevState) =>
                        prevState.map((room) =>
                          room.name === name
                            ? { ...room, isActive: true, messageCnt: 0 }
                            : { ...room, isActive: false }
                        )
                      );
                      setRoom(name);
                      setIsPublic(true);
                      setIsJoined(isJoined);
                    }}
                  >
                    {name}
                  </p>
                  {!isJoined && (
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      style={{
                        "--bs-btn-padding-y": ".25rem",
                        "--bs-btn-padding-x": ".5rem",
                        "--bs-btn-font-size": ".75rem",
                      }}
                      onClick={() => {
                        socket.emit("joinRoom", name);
                        setRooms((prevState) =>
                          prevState.map((room) =>
                            room.name === name
                              ? { ...room, isJoined: true, isActive: true }
                              : { ...room, isActive: false }
                          )
                        );
                        setRoom(name);
                        setIsPublic(true);
                        setIsJoined(true);
                      }}
                    >
                      Join Room
                    </button>
                  )}
                  {isJoined && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{
                        "--bs-btn-padding-y": ".25rem",
                        "--bs-btn-padding-x": ".5rem",
                        "--bs-btn-font-size": ".75rem",
                      }}
                      onClick={() => {
                        socket.emit("leaveRoom", name);
                        setRooms((prevState) =>
                          prevState.map((room) =>
                            room.name === name
                              ? { ...room, isJoined: false, messageCnt: 0 }
                              : room
                          )
                        );

                        if (isActive) setIsJoined(false);
                      }}
                    >
                      Leave Room
                    </button>
                  )}
                  {Boolean(messageCnt) && (
                    <span className="badge bg-danger rounded-pill">
                      {messageCnt}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => createRoomRef.current.classList.remove("invisible")}
          >
            Create New Room
          </button>

          <div className="mb-3 invisible" ref={createRoomRef}>
            <label htmlFor="roomName" className="form-label">
              Room Name
            </label>
            <input
              type="text"
              className="form-control"
              id="roomName"
              ref={createRoominputRef}
            />
            <div className="invalid-feedback" ref={createRoomErrorRef}></div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => createRoomRef.current.classList.add("invisible")}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => createNewRoom(e)}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsList;
