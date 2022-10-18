import UsersList from "../components/UsersList";
import SocketMock from "socket.io-mock";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

describe("UsersList", () => {
  it("should render successfully", () => {
    const users = [
      { userName: "fake1", rooms: ["Public"] },
      { userName: "fake2", rooms: ["Public"] },
      { userName: "fake3", rooms: ["Public"] },
    ];
    const socket = new SocketMock();
    const setPrivateRoom = jest.fn();
    const setIsJoined = jest.fn();
    const setReceiverId = jest.fn();

    socket.on("getAllUsers", () => {
      socket.emit("chatUsers", users);
    });
    render(
      <UsersList
        socket={socket.socketClient}
        userName={"fake1"}
        publicRoom={"Public"}
        setPrivateRoom={setPrivateRoom}
        setIsJoined={setIsJoined}
        setReceiverId={setReceiverId}
      />
    );
    const listItems = screen.getAllByText(/fake*/);
    expect(listItems.length).toBe(3);
  });

  it("should opens private chat", async () => {
    const users = [
      { userName: "fake1", rooms: ["Public"] },
      { userName: "fake2", rooms: ["Public"] },
      { userName: "fake3", rooms: ["Public"] },
    ];
    const user = userEvent.setup();
    const socket = new SocketMock();
    const setPrivateRoom = jest.fn();
    const setIsJoined = jest.fn();
    const setReceiverId = jest.fn();

    socket.on("getAllUsers", () => {
      socket.emit("chatUsers", users);
    });
    render(
      <UsersList
        socket={socket.socketClient}
        userName={"fake1"}
        publicRoom={"Public"}
        setPrivateRoom={setPrivateRoom}
        setIsJoined={setIsJoined}
        setReceiverId={setReceiverId}
      />
    );
    await user.click(screen.getByText(/fake2/));
    const listItems = screen.getAllByText(/fake*/);

    expect(listItems.length).toBe(4);
    expect(setPrivateRoom).toHaveBeenCalledTimes(1);
    expect(setIsJoined).toHaveBeenCalledTimes(1);
    expect(setReceiverId).toHaveBeenCalledTimes(1);
  });

  it("should remove the user from Chats List", async () => {
    const users = [
      { userName: "fake1", rooms: ["Public"] },
      { userName: "fake2", rooms: ["Public"] },
      { userName: "fake3", rooms: ["Public"] },
    ];
    const user = userEvent.setup();
    const socket = new SocketMock();
    const setPrivateRoom = jest.fn();
    const setIsJoined = jest.fn();
    const setReceiverId = jest.fn();

    socket.on("getAllUsers", () => {
      socket.emit("chatUsers", users);
    });
    render(
      <UsersList
        socket={socket.socketClient}
        userName={"fake1"}
        publicRoom={"Public"}
        setPrivateRoom={setPrivateRoom}
        setIsJoined={setIsJoined}
        setReceiverId={setReceiverId}
      />
    );
    await user.click(screen.getByText(/fake2/));
    const listItemsLen1 = screen.getAllByText(/fake*/).length;
    await user.click(screen.getByRole("button", { name: "Close Chat" }));
    const listItemsLen2 = screen.getAllByText(/fake*/).length;

    expect(listItemsLen1).toBe(4);
    expect(listItemsLen2).toBe(3);
    expect(setPrivateRoom).toHaveBeenCalledTimes(2);
    expect(setIsJoined).toHaveBeenCalledTimes(1);
    expect(setReceiverId).toHaveBeenCalledTimes(2);
  });

  it("should add the user to the private chat list when receiving a message", async () => {
    const users = [
      { id: 0, userName: "fake1", rooms: ["Public"] },
      { id: 1, userName: "fake2", rooms: ["Public"] },
      { id: 2, userName: "fake3", rooms: ["Public"] },
    ];
    const socket = new SocketMock();
    const setPrivateRoom = jest.fn();
    const setIsJoined = jest.fn();
    const setReceiverId = jest.fn();

    socket.on("getAllUsers", () => {
      socket.emit("chatUsers", users);
    });

    render(
      <UsersList
        socket={socket.socketClient}
        userName={"fake1"}
        publicRoom={"Public"}
        setPrivateRoom={setPrivateRoom}
        setIsJoined={setIsJoined}
        setReceiverId={setReceiverId}
      />
    );
    act(() => {
      socket.emit("newMessage", {
        content: "Hello",
        senderId: 1,
        senderName: "fake2",
        receiverId: 0,
        isPublic: false,
      });
    });

    const listItems = screen.getAllByText(/fake*/);
    //  console.log(listItems);
    expect(listItems.length).toBe(4);
  });
});
