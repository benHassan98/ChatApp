import React, { useEffect, useRef, useState } from "react";
// import socket from "../services/socket";
import "../styles/Login.css";
const Login = ({socket, setUserName}) => {
  const [usersNames,setUsersNames] = useState([]);
  const userNameRef = useRef();
  const userNameErrorRef = useRef();
  const validateUserName = (e) => {
    e.preventDefault();
    userNameRef.current.className = "form-control";
    if (userNameRef.current.value === "") {
      userNameRef.current.className += " is-invalid";
      userNameErrorRef.current.textContent = "Please Enter Your UserName";
    } else if (userNameRef.current.value.length >= 30) {
      userNameRef.current.className += " is-invalid";
      userNameErrorRef.current.textContent =
        "UserName length should be less than 30 chars";
    } else if (usersNames.indexOf(userNameRef.current.value) !== -1) {
      userNameRef.current.className += " is-invalid";
      userNameErrorRef.current.textContent = "UserName is already used";
    } else {
      setUserName(userNameRef.current.value);
      socket.emit("newUser", userNameRef.current.value, 'Public');
    }
  };

  // useEffect(()=>{
  //   socket.emit("getAllUsers");
  //   const listener = (users) => {
  //     setUsersNames([...new Set([...usersNames,...users.map(user=>user.userName)] )  ]);
  //   };
  // socket.on("chatUsers", listener);

  // return ()=>socket.off('chatUsers',listener);
  // },[]);
  useEffect(() => {
    socket.emit("getAllUsers");
    const listener = (users) => {
      setUsersNames([...new Set([...usersNames,...users.map(user=>user.userName)] )  ]);
    };
  socket.on("chatUsers", listener);

  return ()=>socket.off('chatUsers',listener);
    
  }, [socket]);
  return (
    <div
      className="shadow p-3 mb-5 bg-body rounded"
      style={{ display: "flex", flexDirection: "column", gap: "5px" }}
    >
      <h3 className="text-center ">Chat App</h3>
      <div className="mb-3">
        <label htmlFor="userName" className="form-label">
          User Name
        </label>
        <input
          type="text"
          className="form-control"
          id="userName"
          ref={userNameRef}
        />
        <div className="invalid-feedback" ref={userNameErrorRef}></div>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={(e) => validateUserName(e)}
      >
        Log In
      </button>
    </div>
  );
};

export default Login;
