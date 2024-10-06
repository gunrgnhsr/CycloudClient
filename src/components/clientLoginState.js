import React, { createContext, useContext, useEffect, useState } from 'react';

const LoginStateContext = createContext();

const LoginStateProvider = ({ children }) => {
    const [ReCyCloudtoken, setReCyCloudtoken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkOrUpdateTokeb = (token, isUpdate) => {
        if (isUpdate) {
            setReCyCloudtoken(token);
            setIsLoggedIn(token !== null);
        }else{
            if (ReCyCloudtoken !== null) {
                // ... (your token verification logic)
                console.log('User is logged in with token: ' + ReCyCloudtoken);
                setIsLoggedIn(true);
            } else {
                console.log('User is logged out');
                setIsLoggedIn(false);
            }
        }
    }

    useEffect(() => {
        const intervalId = setInterval(()=>{checkOrUpdateTokeb(ReCyCloudtoken,false)}, 1000); // Check every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    });

    const LogoutModel = () => {
        const handleLogout = async () => {
            try {
                const response = await fetch('http://localhost:8080/logout', {
                    method: 'POST',
                    // credentials: 'include',
                    headers: {
                        'Authorization': `${ReCyCloudtoken}`
                    }
                });
    
                if (response.ok) {
                    checkOrUpdateTokeb(null,true);
                    console.log('Logout successful');
                } else {
                    console.error('Logout failed');
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        };
    
        return (
            isLoggedIn && (<button className="cta-button" onClick={handleLogout}>Logout</button>)
        );
    };

    const LoginModel = () =>{
        const [username, setUsername] = useState("hardUsername");
        const [password, setPassword] = useState("hardPass");
        const [enterLoginForm, setShowLoginModel] = useState(false);
    
        const submitLoginForm = async (event) => {
            event.preventDefault();
        
            try {
              const response = await fetch('http://localhost:8080/login', { // Send POST request to /login
                method: 'POST',
                headers: {
                  'Authorization': 'application/json',
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
              console.log('successfully logged in:', token);
              checkOrUpdateTokeb(token,true);
            } catch (error) {
              // Handle errors (e.g., display an error message)
              console.error('Error during login:', error);
              alert('Login failed. Please check your credentials.');
            } finally {
              setShowLoginModel(false);
            }
        };
    
    
        return (
          <>
            {!isLoggedIn && (<button className="cta-button" onClick={()=>setShowLoginModel(true)}>Get Started</button>)}
            {enterLoginForm && (
              <div id="loginModal" className="modal">
                  <div className='modal-content'>
                      <span className="close-modal" onClick={()=>setShowLoginModel(false)}>&times;</span>
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
            )}
          </>
        );
    }

    return (
        <LoginStateContext.Provider value={{ isLoggedIn, LoginModel , LogoutModel}}> 
            {children}
        </LoginStateContext.Provider>
    );
};

// Custom hook to access the login state
const useLoginState = () => {
    const context = useContext(LoginStateContext);
    if (context === undefined) {
        throw new Error('useLoginState must be used within a LoginStateProvider');   
    }
    return context;
};

export { LoginStateProvider, useLoginState };