const server = require('../app');
const initializeMongoServer = require("../mongoConfigTesting");
const io = require('socket.io-client');
const chai = require('chai');
const should = chai.should();

describe('RealTimeServer',()=>{
let options ={
    transports: ['websocket'],
    'force new connection': true
};
before(async()=>{
await initializeMongoServer();
server.listen('5000');



});

// it('works',(done)=>{
// const client = io.connect('http://localhost:5000',options);
// client.once("connect", function () {
//     client.once("working", (message)=> {
      
//         message.should.equal('it WORKS');

//       client.disconnect();
      
//     });

//     client.emit("test");
//   });


// done();
// });

    
});









