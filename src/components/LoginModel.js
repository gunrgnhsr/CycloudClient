// src/components/LoginModel.js
import React, { useState } from 'react';

function LoginModel({successfulLogin, exitLogin}) {
    const [username, setUsername] = useState("hardUsername");
    const [password, setPassword] = useState("hardPass");
    
    
    const submitLoginForm = async (event) => {
        event.preventDefault();
    
        try {
          const response = await fetch('http://localhost:8080/login', { // Send POST request to /login
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              password: password,
            }),
          });
    
          if (!response.ok) {
            throw new Error('Login failed'); // Handle non-2xx responses
          }
    
          const data = await response.json();
          const token = data.token;
    
          // Store the token (e.g., in local storage)
          localStorage.setItem('token', token);
    
          successfulLogin(); // Call the successfulLogin prop function
        } catch (error) {
          // Handle errors (e.g., display an error message)
          console.error('Error during login:', error);
          alert('Login failed. Please check your credentials.');
        } finally {
          exitLogin();
        }
      };
  
    return (
        <div id="loginModal" className="modal">
            <div className='modal-content'>
                <span className="close-modal" onClick={exitLogin}>&times;</span>
                <h2>Login</h2>
                <form id="loginForm" onSubmit={submitLoginForm}>
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