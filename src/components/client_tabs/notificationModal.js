import React, { useEffect, useState } from 'react';
import { useNotification } from '../../providers/NotificationProvider';
    
function NotificationModel(){
    const { getNotifications, markNotificationAsRead } = useNotification();
    const [notifications, setNotifications] = useState([]);

    const handleSendMessage = () => {
        sendP2PMessage(currentP2PConnectionID, { type: 'message', message: message });
        setMessage('');
    };

    const handleSendCommand = () => {
        sendP2PCommand(currentP2PConnectionID, { type: 'local', path: wasmFileLocation, functionName: 'hello', args: ["yonatan"] });
    };

    useEffect(() => {
        // Update the messages every second, maybe by having a state for new messages
        let interval
        setNotifications(getNotifications());
        interval = setInterval(() => { setNotifications(getNotifications());} , 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
        <button className='cta-button' style={{ backgroundColor: notifications.length > 0 ? 'green' : 'red' }}  onClick={()=>{showNotifications()}}>({notifications.length}) notifications</button>
        <div id="NotificationModal" className="modal">
            <div className="modal-content">
                <span className="close-modal" onClick={()=>closeP2PConnectionModal()}>&times;</span>
                <nav>
                    <div>
                        <h2>Chat</h2>
                        <label htmlFor="wasmFile">Enter message:</label>
                        <input type="text" value={message} onChange={(event) => setMessage(event.target.value)} />
                        <button onClick={handleSendMessage}>Send</button>
                        <nav>
                            <ul>
                                {sentMessages.map((msg, index) => (
                                    <li key={index}>{msg.sender}: {msg.message}</li>
                                ))}
                            </ul>
                            <ul>
                                {receivedMessages.map((msg, index) => (
                                    <li key={index}>{msg.sender}: {msg.message}</li>
                                ))}
                            </ul>
                        </nav>
                    </div>    
                    <div>
                        <h2>Command</h2>
                        <label htmlFor="wasmFile">WASM File Location:</label>
                        <input type="text" id="wasmFile" defaultValue= {wasmFileLocation} onChange={(event) => setWasmFileLocation(event.target.value)}/>
                        <button onClick={handleSendCommand}>Run</button>
                        <ul>
                            {commandResults.map((msg, index) => (
                                <li key={index}>"Result": {msg.result}</li>
                            ))}
                        </ul>
                    </div>
                </nav> 
            </div>
        </div>
        </>
    );
};

export default NotificationModel;