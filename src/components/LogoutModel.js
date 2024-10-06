import React from 'react';
import {useLoginState} from './clientLoginState';

const LogoutModel = () => {
    const getOrSetLoginState = useLoginState("logout");
    const token = getOrSetLoginState(null, true);
    
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8080/logout', {
                method: 'POST',
                // credentials: 'include',
                headers: {
                    'Authorization': `${token}`
                }
            });

            if (response.ok) {
                getOrSetLoginState(null, false);
                console.log('Logout successful');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        (token!==null) && (<button className="cta-button" onClick={handleLogout}>Logout</button>)
    );
};

export default LogoutModel;