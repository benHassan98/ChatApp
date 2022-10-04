import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import ChatPage from "./components/ChatPage";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);
const App = () => {
  const [userName, setUserName] = useState(undefined);
//   const [array,setArray] = useState([]);

//   useEffect(()=>{
//     const fun = (val)=>{
//       console.log('fun',array);
//    setArray([...array,val]);

//     };
//     const fakeLis = (data)=>{
//       setArray(data);
//     };
//     socket.on('ok',fun);
//     socket.on('fake',fakeLis);
//     return ()=>{
//       socket.off('ok',fun);
//       socket.off('fake',fakeLis);
//     }
//   },[]);
// useEffect(()=>{
//   socket.emit('fake');
// },[]);

// return (
//   <div>
//     {array.map((i,id)=>{
//       return (<div key={id}>{'a: '+i.a}</div>);
//     })
//     }
// <button onClick={()=>socket.emit('try')}>Click Me</button>
//   </div>
// );

  if (!userName) return <Login socket={socket} setUserName={setUserName} />;
  else return <ChatPage socket={socket} userName={userName} />;
};
export default App;
