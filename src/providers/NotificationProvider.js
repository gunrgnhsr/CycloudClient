import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

const useNotification = () => {
    return useContext(NotificationContext);
};

const NotificationStateProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const registerNotification = (notification) => {
        setNotifications([...notifications, notification]);
    }

    return (
        <NotificationContext.Provider value={{ notifications, registerNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export { useNotification, NotificationStateProvider };