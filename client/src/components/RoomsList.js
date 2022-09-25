import React, { useEffect, useRef, useState } from "react";
import "../styles/RoomsList.css";
const RoomsList = ({ socket, room, setRoom, setIsPublic }) => {
  const [rooms, setRooms] = useState([]);
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
      setRooms([...rooms, createRoominputRef.current.value]);
    }
  };
  useEffect(() => {
    socket.emit("getAllusers");
  }, []);
  useEffect(() => {
    const chatUsersListener = (users) => {
      const newRooms = users
        .map(({ rooms }) => rooms)
        .flat()
        .filter((room) => !Boolean(rooms.find(({ name }) => room === name)))
        .map((room) => ({
          ref: useRef(),
          messageCnt: 0,
          name: room,
          isJoined: false,
        }));

      setRooms([...rooms, ...newRooms]);
    };
    socket.on("chatUsers", chatUsersListener);

    return () => socket.removeListner("chatUsers", chatUsersListener);
  }, [socket]);

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
        tabindex="-1"
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
            {rooms.map(({ name, ref, isJoined, messageCnt }, id) => {
              return (
                <div
                  className="list-group-item d-flex justify-content-between align-items-center "
                  id={id}
                  ref={ref}
                >
                  <p
                    onClick={() => {
                      rooms.forEach(({ ref }) =>
                        ref.current.classList.remove("active")
                      );
                      ref.current.classList.add("active");
                      setRoom(name);
                      setIsPublic(true);
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
                        socket.emit("joinRoom", room);
                        setRooms(
                          rooms.map((room) =>
                            room.name === name
                              ? { ...room, isJoined: true }
                              : room
                          )
                        );
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
                        socket.emit("leaveRoom", room);
                        setRooms(
                          rooms.map((room) =>
                            room.name === name
                              ? { ...room, isJoined: false, messageCnt: 0 }
                              : room
                          )
                        );
                      }}
                    >
                      Leave Room
                    </button>
                  )}
                  {messageCnt && (
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
