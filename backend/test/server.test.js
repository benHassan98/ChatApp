const io = require("../app");
const initializeMongoServer = require("../mongoConfigTesting");
const Client = require("socket.io-client");
const { expect } = require("chai");
const CreateMessage = require('../utils/CreateMessage');

describe("User", () => {
  let options = {
    transports: ["websocket"],
    forceNew:true,
    reconnection: false,
  };

  
  before(async () => {
    io.listen(5000);
    await initializeMongoServer();
  });

  it("should join rooms", (done) => {
   let clientSocket = new Client("http://localhost:5000", options);
   const roomName = 'room at '+new Date().valueOf();
    clientSocket.emit("newUser", "fake1", roomName);
    let chatUsersTest = (roomUsers) => {
      // console.log(roomUsers);
      expect(roomUsers).to.deep.equal([
        {
          id: clientSocket.id,
          userName: "fake1",
          rooms: [roomName, "fakeRoom"],
        },
      ]);
    };
   let newMessageTest = (message) => {
      // console.log(message);
      expect(message).to.deep.equal({
        senderId: "ChatBot",
        isPublic:true,
        room: "fakeRoom",
        content: "fake1 joined the Room",
      });
      clientSocket.disconnect();
    };
    console.log(clientSocket.listeners("chatUsers"));
    console.log(clientSocket.listeners("newMessage"));
    clientSocket.once("chatUsers", () => {});
    clientSocket.once("newMessage", () => {

      clientSocket.once("chatUsers", chatUsersTest);
      clientSocket.once("newMessage", newMessageTest);

      clientSocket.emit("joinRoom", "fakeRoom");
      
    });
    
    done();
  });

it('should leave rooms',(done)=>{
  let clientSocket = new Client("http://localhost:5000", options);
  let clientSocket2 = new Client('http://localhost:5000',options);
  const roomName = 'room at '+new Date().valueOf();
  clientSocket.emit("newUser", "fake2", roomName);
  
  let chatUsersTest = (roomUsers) => {
    // console.log(roomUsers);
    expect(roomUsers).to.deep.equal([
      {
        id: clientSocket2.id,
        userName: "fake22",
        rooms: [roomName],
      },
    ]);
  };
  let newMessageTest = (message) => {
    // console.log(message);
    expect(message).to.deep.equal({
      senderId: "ChatBot",
      room: roomName,
      isPublic:true,
      content: "fake2 left the Room",
    });
    clientSocket.disconnect();
    clientSocket2.disconnect();
  };
  clientSocket.once("chatUsers", () => {});
  clientSocket.once("newMessage", () => {
    clientSocket2.emit('newUser','fake22',roomName); 
    

    clientSocket2.once("chatUsers", ()=>{});
    clientSocket2.once("newMessage", ()=>{
    
    
      clientSocket2.once('chatUsers',chatUsersTest);
      clientSocket2.once('newMessage',newMessageTest);

    });

    clientSocket.emit("leaveRoom", roomName);
  });


done();
});

it('should send messages to public rooms',(done)=>{
  let clientSocket = new Client("http://localhost:5000", options);
  let clientSocket2 = new Client("http://localhost:5000", options);
  const roomName = 'room at '+new Date().valueOf();
  clientSocket.emit("newUser", "fake3", roomName);
  
  let newMessageTest = (message) => {
    // console.log(message);
    expect(message).to.deep.equal({
      senderId: clientSocket.id,
      isPublic:true,
      room: roomName,
      content: "hello world",
    });
    clientSocket.disconnect();
    clientSocket2.disconnect();
  };

  clientSocket.once("chatUsers", () => {});
  clientSocket.once("newMessage", () => {

    clientSocket2.emit('newUser','fake33',roomName); 
    

    clientSocket2.once("chatUsers", ()=>{});
    clientSocket2.once("newMessage", ()=>{
    
      clientSocket2.once('newMessage',newMessageTest);

    });

    clientSocket.emit("newMessage", roomName,{
      senderId: clientSocket.id,
      isPublic:true,
      room: roomName,
      content: "hello world",
    });

  });



done();

});


it('should send messages to other user in private room',(done)=>{
  let clientSocket = new Client("http://localhost:5000", options);
  let clientSocket2 = new Client("http://localhost:5000", options);
  const roomName = 'user '+new Date().valueOf() +"'s room";
  clientSocket.emit("newUser", "fake4", roomName);
  
  let newMessageTest = (message) => {
    // console.log(message);
    expect(message).to.deep.equal({
      senderId: clientSocket.id,
      receiverId:clientSocket2.id,
      room: clientSocket2.id,
      isPublic:false,
      content: "hello world",
    });
    clientSocket.disconnect();
    clientSocket2.disconnect();
  };

  clientSocket.once("chatUsers", () => {});
  clientSocket.once("newMessage", () => {

    clientSocket2.emit('newUser','fake44',roomName); 
    

    clientSocket2.once("chatUsers", ()=>{});
    clientSocket2.once("newMessage", ()=>{
    
      clientSocket2.once('newMessage',newMessageTest);

    });

    clientSocket.emit("newMessage", clientSocket2.id,{
      senderId: clientSocket.id,
      receiverId:clientSocket2.id,
      room: clientSocket2.id,
      isPublic:false,
      content: "hello world",
    });

  });



done();

});







it('should get messages in a public room',async()=>{
  let clientSocket = new Client("http://localhost:5000", options);
  const roomName = 'room at '+new Date().valueOf();
  
  clientSocket.emit("newUser", "fake5", roomName);
  let getMessagesTest = (messages) => {
    // console.log(messages);
    expect(messages[0]).to.have.deep.property('content','fake5 joined the Room');
    expect(messages[1]).to.have.deep.property('content','this is fake message 1');
    expect(messages[1]).to.have.deep.property('senderId',clientSocket.id);
    expect(messages[1]).to.have.deep.property('isPublic',true);
    expect(messages[2]).to.have.deep.property('content','this is fake message 2');
    expect(messages[2]).to.have.deep.property('senderId',clientSocket.id);
    expect(messages[2]).to.have.deep.property('isPublic',true);
    clientSocket.disconnect();
  };

  clientSocket.once("chatUsers", () => {});
  clientSocket.once("newMessage", async () => {
    await CreateMessage({
      senderId:clientSocket.id,
      room:roomName,
      isPublic:true,
      content:'this is fake message 1'
      });
      await CreateMessage({
        senderId:clientSocket.id,
        room:roomName,
        isPublic:true,
        content:'this is fake message 2'
        });

  clientSocket.once('getMessages',getMessagesTest);

  clientSocket.emit('getMessages',roomName,true);  
});


  

  
});

it('should get messages in a private room',async()=>{
  let clientSocket = new Client("http://localhost:5000", options);
  const roomName = 'room at '+new Date().valueOf();
  clientSocket.emit("newUser", "fake6", roomName);
  let getMessagesTest = (messages) => {
    // console.log(messages);
    expect(messages[0]).to.have.deep.property('content','eh yacta');
    expect(messages[0]).to.have.deep.property('senderId',clientSocket.id);
    expect(messages[0]).to.have.deep.property('receiverId','12345');
    expect(messages[0]).to.have.deep.property('isPublic',false);
    expect(messages[1]).to.have.deep.property('content','brdo eh yacta');
    expect(messages[1]).to.have.deep.property('senderId',clientSocket.id);
    expect(messages[1]).to.have.deep.property('receiverId','12345');
    expect(messages[1]).to.have.deep.property('isPublic',false);
    clientSocket.disconnect();
  };

  clientSocket.once("chatUsers", () => {});
  clientSocket.once("newMessage", async () => {
    await CreateMessage({
      senderId:clientSocket.id,
      receiverId:'12345',
      room:'12345',
      isPublic:false,
      content:'eh yacta'
      });
      await CreateMessage({
        senderId:clientSocket.id,
        receiverId:'12345',
        room:'12345',
        isPublic:false,
        content:'brdo eh yacta'
        });

  clientSocket.once('getMessages',getMessagesTest);

  clientSocket.emit('getMessages','12345',false);  
});


  

  
});





});



