import React, { useEffect, useState } from 'react';
import { useP2PCommunication } from '../../providers/P2PCommunicationProvider';
import AddTask from './clientTasks';
    
function P2PCommunicationModel({availableHeight, currentP2PConnectionID, closeP2PConnectionModal, isLoaner}) {
    const { makeAConnectionOffer ,sendP2PMessage, getSentMessages, getReceivedMessages} = useP2PCommunication();

    const [P2PConnectionEstablished, setP2PConnectionEstablished] = useState(false);
    const [message, setMessage] = useState('');
    const [sentMessages, setSentMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);

    const handleSendMessage = () => {
        sendP2PMessage(currentP2PConnectionID, { type: 'message', message: message });
        setMessage('');
    };

    useEffect(() => {
        if(isLoaner && !P2PConnectionEstablished){ 
            makeAConnectionOffer(currentP2PConnectionID, setP2PConnectionEstablished);       
        }
        if(!isLoaner || P2PConnectionEstablished){
            getSentMessages(currentP2PConnectionID,setSentMessages);
            getReceivedMessages(currentP2PConnectionID,setReceivedMessages);
        }
    }, [P2PConnectionEstablished]);

    return (
        <div id="P2PMessagesModal" className="modal">
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
                        {P2PConnectionEstablished && (
                            <AddTask availableHeight={availableHeight} remoteConnectionID={currentP2PConnectionID}/>
                        )}
                    </div>
                </nav> 
            </div>
        </div>
    );
};

export default P2PCommunicationModel;