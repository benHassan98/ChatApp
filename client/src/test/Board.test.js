import Board from "../components/Board";
import SocketMock from "socket.io-mock";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

window.HTMLElement.prototype.scrollIntoView = jest.fn();
describe("Board", () => {
  it("should render successfully", () => {
    const socket = new SocketMock();
    socket.on("getMessages", () => {
      socket.emit("getMessages", [
        {
          content: "msg1",
          isPublic: true,
        },
        {
          content: "msg2",
          isPublic: true,
        },
        {
          content: "msg3",
          isPublic: true,
        },
      ]);
    });
    render(
      <Board
        socket={socket.socketClient}
        userName={"fake"}
        publicRoom={"Public"}
        privateRoom={null}
        isJoined={true}
        receiverId={null}
      />
    );

    const messagesBoard = screen.getByTestId("messages");
    const textArea = screen.getByTestId("text-area");
    const sendBtn = screen.getByRole("button", { name: "Send" });
    const messages = screen.getAllByText(/msg*/);

    expect(messagesBoard).toBeDefined();
    expect(textArea).toBeDefined();
    expect(messages.length).toBe(3);
    expect(sendBtn).toBeDefined();
  });

  it(" should receive messages in public room", () => {
    const socket = new SocketMock();
    socket.on("getMessages", () => {
      socket.emit("getMessages", [
        {
          content: "msg1",
          isPublic: true,
        },
        {
          content: "msg2",
          isPublic: true,
        },
        {
          content: "msg3",
          isPublic: true,
        },
      ]);
    });
    render(
      <Board
        socket={socket.socketClient}
        userName={"fake"}
        publicRoom={"Public"}
        privateRoom={null}
        isJoined={true}
        receiverId={null}
      />
    );
    act(() => {
      socket.emit("newMessage", {
        content: "Hello",
        room: "Public",
        senderId: 1,
        senderName: "abc",
      });
    });

    const messages = screen.getAllByText(/msg*/);
    const sentMessage = screen.getByText(/Hello/);

    expect(messages.length).toBe(3);
    expect(sentMessage.textContent).toBe("Hello");
  });
  it("should send messages in public rooms", async () => {
    const socket = new SocketMock();
    const user = userEvent.setup();
    socket.on("getMessages", () => {
      socket.emit("getMessages", [
        {
          content: "msg1",
          isPublic: true,
        },
        {
          content: "msg2",
          isPublic: true,
        },
        {
          content: "msg3",
          isPublic: true,
        },
      ]);
    });
    socket.on("newMessage", (message) => {
      expect(message.senderName).toBe("fake");
      expect(message.room).toBe("Public");
      expect(message.isPublic).toBe(true);
      expect(message.content).toBe("Hello");
    });
    render(
      <Board
        socket={socket.socketClient}
        userName={"fake"}
        publicRoom={"Public"}
        privateRoom={null}
        isJoined={true}
        receiverId={null}
      />
    );

    const textArea = screen.getByTestId("text-area");
    const sendBtn = screen.getByRole("button", { name: "Send" });

    await user.type(textArea, "Hello");
    await user.click(sendBtn);
  });
  it(" should receive messages in private room", () => {
    const socket = new SocketMock();
    render(
      <Board
        socket={socket.socketClient}
        userName={"fake"}
        publicRoom={"Public"}
        privateRoom={"Private"}
        isJoined={true}
        receiverId={"123"}
      />
    );
    act(() => {
      socket.emit("newMessage", {
        content: "Hello",
        room: "Private",
        senderId: 1,
        senderName: "abc",
      });
    });
    const sentMessage = screen.getByText(/Hello/);
    expect(sentMessage.textContent).toBe("Hello");
  });
  it("should send messages in private rooms", async () => {
    const socket = new SocketMock();
    const user = userEvent.setup();
    socket.on("newMessage", (message) => {
      expect(message.senderName).toBe("fake");
      expect(message.room).toBe("Private");
      expect(message.isPublic).toBe(false);
      expect(message.content).toBe("Hello");
      expect(message.receiverId).toBe("123");
    });
    render(
      <Board
        socket={socket.socketClient}
        userName={"fake"}
        publicRoom={"Public"}
        privateRoom={"Private"}
        isJoined={true}
        receiverId={"123"}
      />
    );

    const textArea = screen.getByTestId("text-area");
    const sendBtn = screen.getByRole("button", { name: "Send" });

    await user.type(textArea, "Hello");
    await user.click(sendBtn);
  });
  it("should disable send button if user is disconnected", () => {
    const socket = new SocketMock();
    render(
      <Board
        socket={socket.socketClient}
        userName={"fake"}
        publicRoom={"Public"}
        privateRoom={"Private"}
        isJoined={true}
        receiverId={"123"}
      />
    );
    act(() => {
      socket.emit("newMessage", {
        isDisconnected: 1,
        userId: "123",
      });
    });
    const sendBtn = screen.getByRole("button", { name: "Send" });
    expect(sendBtn.getAttributeNames().includes("disabled")).toBe(true);
  });
});
