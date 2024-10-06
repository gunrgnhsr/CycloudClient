import React, { createContext, useContext, useEffect, useState } from 'react';

const LoginStateContext = createContext();

const LoginStateProvider = ({ children }) => {
    const [ReCyCloudtoken, setReCyCloudtoken] = useState(null);

    useEffect(() => {
        const checkLoginState = () => {
            if (ReCyCloudtoken !== null) {
                // ... (your token verification logic)
                console.log('User is logged in with token: ' + ReCyCloudtoken);
            } else {
                console.log('User is logged out');
            }
        };

        const intervalId = setInterval(checkLoginState, 1000); // Check every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [ReCyCloudtoken]);

    // Function to update the login state
    const getOrSetLoginState = (token, getOrSet) => {
        if (getOrSet) {
            return ReCyCloudtoken;
        } else {
            setReCyCloudtoken(token);
        }
    };

    return (
        <LoginStateContext.Provider value={{ ReCyCloudtoken, getOrSetLoginState }}> 
            {children}
        </LoginStateContext.Provider>
    );
};

// Custom hook to access the login state
const useLoginState = (model) => {
    const context = useContext(LoginStateContext);
    if (context === undefined) {
        throw new Error('useLoginState must be used within a LoginStateProvider');   
    }
    if (model === 'login' || model === 'logout') {
        return context.getOrSetLoginState;
    }else return context.ReCyCloudtoken!==null ? true : false;
};

export { LoginStateProvider, useLoginState };