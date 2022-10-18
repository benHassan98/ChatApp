import RoomsList from '../components/RoomsList';
import SocketMock from "socket.io-mock";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";


describe("RoomsList",()=>{

it('should render successfully',()=>{
const socket = new SocketMock();
const setPublicRoom = jest.fn();
const setIsJoined = jest.fn();
const setPrivateRoom = jest.fn();
const setReceiverId = jest.fn();
socket.on('getAllRooms',()=>{
    socket.emit('getAllRooms',[
        'Public',
        'Room1',
        'Room2'
    ]);
});
render(
<RoomsList
socket={socket.socketClient}
privateRoom={null}
setPublicRoom={setPublicRoom}
setPrivateRoom={setPrivateRoom}
setIsJoined={setIsJoined}
setReceiverId={setReceiverId}
/>);

const rooms = screen.getAllByText(/Room(1|2)|Public/);
const showRooms = screen.getByRole('button',{name:'Show Rooms'});
const input = screen.getByRole('textbox');


expect(rooms.length).toBe(3);
expect(showRooms).toBeDefined();
expect(input).toBeDefined();

});

it('should add rooms to list',()=>{

    const socket = new SocketMock();
    const setPublicRoom = jest.fn();
    const setIsJoined = jest.fn();
    const setPrivateRoom = jest.fn();
    const setReceiverId = jest.fn();
    socket.on('getAllRooms',()=>{
        socket.emit('getAllRooms',[
            'Public',
            'Room1',
            'Room2'
        ]);
    });
    render(
    <RoomsList
    socket={socket.socketClient}
    privateRoom={null}
    setPublicRoom={setPublicRoom}
    setPrivateRoom={setPrivateRoom}
    setIsJoined={setIsJoined}
    setReceiverId={setReceiverId}
    />);
act(()=>{
socket.emit('newRoom','Room3');
});


const rooms = screen.getAllByText(/Room(1|2|3)|Public/);

expect(rooms.length).toBe(4);

});
it('should change Rooms',async()=>{
    const user = userEvent.setup();
    const socket = new SocketMock();
    const setPublicRoom = jest.fn();
    const setIsJoined = jest.fn();
    const setPrivateRoom = jest.fn();
    const setReceiverId = jest.fn();
    socket.on('getAllRooms',()=>{
        socket.emit('getAllRooms',[
            'Public',
            'Room1',
            'Room2'
        ]);
    });
    render(
    <RoomsList
    socket={socket.socketClient}
    privateRoom={null}
    setPublicRoom={setPublicRoom}
    setPrivateRoom={setPrivateRoom}
    setIsJoined={setIsJoined}
    setReceiverId={setReceiverId}
    />);


await user.click(screen.getByText(/Room2/));

expect(setPublicRoom).toHaveBeenCalledTimes(1);
expect(setPrivateRoom).toHaveBeenCalledTimes(1);
expect(setReceiverId).toHaveBeenCalledTimes(1);
expect(setIsJoined).toHaveBeenCalledTimes(1);

});
it('should join Rooms',async()=>{

        const user = userEvent.setup();
        const socket = new SocketMock();
        const setPublicRoom = jest.fn();
        const setIsJoined = jest.fn();
        const setPrivateRoom = jest.fn();
        const setReceiverId = jest.fn();
        socket.on('getAllRooms',()=>{
            socket.emit('getAllRooms',[
                'Public',
                'Room1',
                'Room2'
            ]);
        });
        socket.on('joinRoom',(roomName)=>{
   
            socket.emit('newMessage',{
                isPublic:true,
                room:roomName,
            });
                    });
        render(
        <RoomsList
        socket={socket.socketClient}
        privateRoom={null}
        setPublicRoom={setPublicRoom}
        setPrivateRoom={setPrivateRoom}
        setIsJoined={setIsJoined}
        setReceiverId={setReceiverId}
        />);
    
    
    await user.click(screen.getAllByRole('button',{name:'Join Room'})[0]);
    
    expect(setPublicRoom).toHaveBeenCalledTimes(1);
    expect(setPublicRoom).toHaveBeenCalledWith('Room1');
    expect(setIsJoined).toHaveBeenCalledTimes(1);
    
    
});
it('should leave Rooms',async()=>{
    const user = userEvent.setup();
    const socket = new SocketMock();
    const setPublicRoom = jest.fn();
    const setIsJoined = jest.fn();
    const setPrivateRoom = jest.fn();
    const setReceiverId = jest.fn();
    socket.on('getAllRooms',()=>{
        socket.emit('getAllRooms',[
            'Public',
            'Room1',
            'Room2'
        ]);
    });
    socket.on('leaveRoom',(roomName)=>{

        expect(roomName).toBe('Public');
                });
    render(
    <RoomsList
    socket={socket.socketClient}
    privateRoom={null}
    setPublicRoom={setPublicRoom}
    setPrivateRoom={setPrivateRoom}
    setIsJoined={setIsJoined}
    setReceiverId={setReceiverId}
    />);


await user.click(screen.getByRole('button',{name:'Leave Room'}));

expect(setIsJoined).toHaveBeenCalledTimes(1);
expect(setIsJoined).toHaveBeenCalledWith(false);


});

it('should create Rooms',async()=>{


    const user = userEvent.setup();
    const socket = new SocketMock();
    const setPublicRoom = jest.fn();
    const setIsJoined = jest.fn();
    const setPrivateRoom = jest.fn();
    const setReceiverId = jest.fn();
    socket.on('getAllRooms',()=>{
        socket.emit('getAllRooms',[
            'Public',
            'Room1',
            'Room2'
        ]);
    });
    render(
    <RoomsList
    socket={socket.socketClient}
    privateRoom={null}
    setPublicRoom={setPublicRoom}
    setPrivateRoom={setPrivateRoom}
    setIsJoined={setIsJoined}
    setReceiverId={setReceiverId}
    />);


const input = screen.getByRole('textbox');
await user.type(input,'Room3');
await user.click(screen.getByRole('button',{name:'Create'}))

const room3 = screen.getByText(/Room3/);

expect(room3).toBeDefined();

});

});