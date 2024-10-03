// src/components/LoginModel.js
import React, { useState } from 'react';

function LoginModel({successfulLogin, exitLogin}) {
    const [username, setUsername] = useState("hardUsername");
    const [password, setPassword] = useState("hardPass");
    
    
    const submitLoginForm = (successfulLogin, exitLogin) => {
        if (username === "hardUsername" && password === "hardPass") {
            successfulLogin();
        } else {
            // Handle incorrect credentials (e.g., display an error message)
            alert("Incorrect username or password");
        }
    
        exitLogin();
    };
  
    return (
        <div id="loginModal" className="modal">
            <div className='modal-content'>
                <span className="close-modal" onClick={exitLogin}>&times;</span>
                <h2>Login</h2>
                <form id="loginForm" onSubmit={()=>submitLoginForm(successfulLogin, exitLogin)}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                        required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                        required/>
                    </div>
                    <button type="submit" className="submit-btn">Login</button>
                </form>
            </div>
        </div>
    );
}

export default LoginModel;