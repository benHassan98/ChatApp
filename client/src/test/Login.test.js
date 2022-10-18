import Login from '../components/Login';
import SocketMock from 'socket.io-mock';
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";


describe('Login',()=>{

it('should render successfully',()=>{
    const setUserName = jest.fn();
    let socket = new SocketMock();
    socket.on('getAllUsers',()=>{
        socket.emit('chatUsers',[]);
    });
    
render(<Login socket={socket.socketClient} setUserName={setUserName}/>);
const userName = screen.getByTestId('userName');
const userNameError = screen.getByTestId('userNameError');
const loginBtn = screen.getByRole('button',{name:'Log In'});

expect(userName).toBeDefined();
expect(userNameError).toBeDefined();
expect(loginBtn).toBeDefined();

});

it('should throw error when userName length >=30',async()=>{
    const setUserName = jest.fn();
    let socket = new SocketMock();
    let inValidUserName = Array(33).fill('a').join('');
    const user = userEvent.setup();
    socket.on('getAllUsers',()=>{
        socket.emit('chatUsers',[]);
    });

render(<Login socket={socket.socketClient} setUserName={setUserName}/>);
const userName = screen.getByTestId('userName');
const userNameError = screen.getByTestId('userNameError');
const loginBtn = screen.getByRole('button',{name:'Log In'});

 await user.clear(userName);
 await user.type(userName,inValidUserName);
 await user.click(loginBtn);
 
 expect(userName.classList.contains('is-invalid')).toBeTruthy();
 expect(userNameError.textContent).toBe("UserName length should be less than 30 chars");
});


it('should throw error when userName already exists',async()=>{
    const setUserName = jest.fn();
    let socket = new SocketMock();
    let inValidUserName = 'abc';
    const user = userEvent.setup();
    socket.on('getAllUsers',()=>{
   
        socket.emit('chatUsers',[{userName:'abc'}]);
    });
   
render(<Login socket={socket.socketClient} setUserName={setUserName}/>);
const userName = screen.getByTestId('userName');
const userNameError = screen.getByTestId('userNameError');
const loginBtn = screen.getByRole('button',{name:'Log In'});

 await user.clear(userName);
 await user.type(userName,inValidUserName);
 await user.click(loginBtn);
 

 expect(userName.classList.contains('is-invalid')).toBeTruthy();
 expect(userNameError.textContent).toBe("UserName is already used");

});


it('should login successfully when submitting valid userName',async()=>{
    const setUserName = jest.fn();
    let socket = new SocketMock();
    let validUserName = 'abc';
    const user = userEvent.setup();
    socket.on('getAllUsers',()=>{
   
        socket.emit('chatUsers',[{userName:'abd'}]);
    });
   
render(<Login socket={socket.socketClient} setUserName={setUserName}/>);
const userName = screen.getByTestId('userName');
const userNameError = screen.getByTestId('userNameError');
const loginBtn = screen.getByRole('button',{name:'Log In'});

 await user.clear(userName);
 await user.type(userName,validUserName);
 await user.click(loginBtn);
 

 expect(setUserName).toHaveBeenCalledTimes(1);

});




});