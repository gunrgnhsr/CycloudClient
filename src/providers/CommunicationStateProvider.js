import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWebWorkers } from './WebWorkersProvider';
import axios from 'axios';

const CommunicationContext = createContext();

const useCommunication = () => {
    return useContext(CommunicationContext);
};

const CommunicationStateProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverUrl, setServerUrl] = useState('localhost:3001/'); // Set your server URL here
    const wsAdd = 'ws://';
    const httpADD = 'http://'; 
    const [loadingIterator, setLoadingIterator] = useState(0);
    const [isLan, setIsLan] = useState(false);
    const { postWorkerTask, createWebWorker } = useWebWorkers();

    const getServerFullUrl = (endpoint, isHttp) => {
        return isHttp ? httpADD + serverUrl + endpoint : wsAdd + serverUrl + endpoint;
    }

    const OpenLanCommunicationIndicator = () => {
        
        const changeServerUrl = () => {
            setServerUrl(isLan ? 'localhost:3001/' : '192.168.50.46:3001/');
            setIsLan(isLan => !isLan);
        };

        return (
            <>
                {<button className='cta-button' style={{ backgroundColor: isLan ? 'green' : 'red' }}  onClick={()=>{changeServerUrl()}}>In Lan</button>}
            </>
        );
    };

    const CommunicationIndicator = () => {        
        useEffect(() => {
            if (!loading) {
                return;
            }
            const interval = setInterval(() => {
                setLoadingIterator((loadingIterator + 1) % 6);
            }, 50);

            return () => clearInterval(interval);
        }, [loading]);

        
        return (
            <>
                {<img src={'./res/logos/ReCyCloud_Logo_'+(loadingIterator)+'.png'} alt="Cycloud logo" className="logo" width="180" height="180"/>}
            </>
        );
    };

    const logRequestDetails = (method, endpoint, data, config) => {
        console.log(`HTTP ${method} Request to ${getServerFullUrl(endpoint, true)}`);
        if (data) {
            console.log('Request Data:', data);
        }
        if (config) {
            console.log('Request Config:', config);
        }
    };

    const logResponseDetails = (method, endpoint, response) => {
        console.log(`HTTP ${method} Response from ${getServerFullUrl(endpoint, true)}`);
        console.log('Response:', response);
    }


    const get = async (endpoint, config) => {
        setLoading(true);
        try {
            logRequestDetails('get', endpoint, null, config);
            const response = await axios.get(`${getServerFullUrl(endpoint, true)}`, config);
            setLoading(false);
            logResponseDetails('get', endpoint, response);
            return response;
        } catch (err) {
            setLoading(false);
            setError(err);
            throw err;
        }
    };

    const addContentType = (config) => {
        if (!config) {
            return { headers: { 'Content-Type': 'application/json' } };
        }
        if (!config.headers) {
            return { ...config, headers: { 'Content-Type': 'application/json' } };
        }
        if (!config.headers['Content-Type']) {
            return { ...config, headers: { ...config.headers, 'Content-Type': 'application/json' } };
        }
        return config;
    };

    const post = async (endpoint, data, config) => {
        setLoading(true);
        try {
            logRequestDetails('post', endpoint, data, config);
            const response = await axios.post(`${getServerFullUrl(endpoint, true)}`, data, addContentType(config));
            setLoading(false);
            logResponseDetails('post', endpoint, response);
            return response;
        } catch (err) {
            setLoading(false);
            setError(err);
            throw err;
        }
    };

    const put = async (endpoint, data, config) => {
        setLoading(true);
        try {
            logRequestDetails('put', endpoint, data, config);
            const response = await axios.put(`${getServerFullUrl(endpoint, true)}`, data, config);
            setLoading(false);
            logResponseDetails('put', endpoint, response);
            return response;
        } catch (err) {
            setLoading(false);
            setError(err);
            throw err;
        }
    };

    const del = async (endpoint, config) => {
        setLoading(true);
        try {
            logRequestDetails('delete', endpoint, null, config);
            const response = await axios.delete(`${getServerFullUrl(endpoint, true)}`, config);
            setLoading(false);
            logResponseDetails('delete', endpoint, response);
            return response;
        } catch (err) {
            setLoading(false);
            setError(err);
            throw err;
        }
    };

    const fetchRequest = async (endpoint, method , data , config) => {
        setLoading(true);
        try {
            logRequestDetails(method, endpoint, data, config);
            const response = await fetch(`${getServerFullUrl(endpoint, true)}`, {
                method: method, 
                body: data, 
                headers: addContentType(config).headers
            });
            setLoading(false);
            logResponseDetails(method, endpoint, response);
            return response;
        } catch (err) {
            setLoading(false);
            setError(err);
            throw err;
        }
    }

    const ID2WebSocket = useRef({});
    const [, setID2WebSocket] = useState({});

    const webSocketRequest = async (endpoint, onMessage, ID, onError) => {
        const ws = new WebSocket(`${getServerFullUrl(endpoint, false)}`);
        ID2WebSocket.current = { ...ID2WebSocket.current, [ID]: ws };
        setID2WebSocket(ID2WebSocket.current);
        
        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.onmessage = (event) => {
            onMessage(event);
        };

        ws.onerror = (event) => {
            onError(event);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

    }

    const sendWebSocketMessage = (id, message) => {
        if (ID2WebSocket.current[id] && ID2WebSocket.current[id].readyState === WebSocket.OPEN) {
            const messageString = JSON.stringify(message);
            ID2WebSocket.current[id].send(messageString);
        }
    }

    const closeWebSocket = (id) => {
        if (ID2WebSocket.current[id] && ID2WebSocket.current[id].readyState === WebSocket.CLOSED) {
            ID2WebSocket.current[id].close();
            delete ID2WebSocket.current[id];
            setID2WebSocket(ID2WebSocket.current);
        }
    }

    const establishSSEStream = async (response , onMessage) => {
        if (response.body && response.body.getReader) {
            const reader = response.body.getReader();
            let result = '';
            let mesCounter = 0;
            
            while (true) {
                const { done, value } = await reader.read();
                result += new TextDecoder().decode(value);
                let delimiterIndex;
                while ((delimiterIndex = result.indexOf('\n\n')) !== -1) {
                    const message = JSON.parse(result.slice(0, delimiterIndex));
                    console.log(`Message number ${mesCounter}: `, message);
                    mesCounter++;
                    if(message.data !== "keep-alive"){
                        onMessage(message);
                    }
                    result = result.slice(delimiterIndex + 2);
                }

                if (done) {
                    return;
                }
            } 
        }
    }

    const ID2Connection = useRef({});
    const [, setID2Connection] = useState({}); 

    const establishP2PConnection = async (connectionID) => {        
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const pc = new RTCPeerConnection(configuration);

        ID2Connection.current = {
            ...ID2Connection.current, 
            [connectionID]: { pc: pc, channel: null, messages: [], iceCandidates: [] }
        };
        setID2Connection(ID2Connection.current);

        pc.onicecandidate = (event) => {
            if (event.candidate){
                ID2Connection.current[connectionID].iceCandidates.push(event.candidate);
                setID2Connection(ID2Connection.current);
            }
        };

        pc.ondatachannel = (event) => {
            const receivedChannel = event.channel;
            ID2Connection.current[connectionID].channel = receivedChannel;
            setID2Connection(ID2Connection.current);

            receivedChannel.onmessage = (event) => {
                ID2Connection.current[connectionID].messages.push({ sender: 'remote', message: event.data });
                setID2Connection(ID2Connection.current);
            };

            receivedChannel.onopen = () => {
                console.log('Data channel opened!');
            };

            receivedChannel.onclose = () => {
                console.log('Data channel closed!');
            };
        };
    }

    const sendIceCandidate = async (connectionID, sendFunction) => {
        if(ID2Connection.current[connectionID] && ID2Connection.current[connectionID].iceCandidates){
            await sendFunction(connectionID ,{type: "iceCandidates", iceCandidates: ID2Connection.current[connectionID].iceCandidates});
        }
    }

    const closeP2PConnection = (connectionID) => {
        if (ID2Connection.current[connectionID] && ID2Connection.current[connectionID].pc) {
            ID2Connection.current[connectionID].pc.close();
            ID2Connection.current[connectionID].channel.close();
            delete ID2Connection.current[connectionID];
            setID2Connection(ID2Connection.current);
        }
    }

    
    const handleOffer = async (offer, connectionID) => {
        try {
            const connection = ID2Connection.current[connectionID].pc;
            await connection.setRemoteDescription(offer);
            const answer = await connection.createAnswer();
            await connection.setLocalDescription(answer); 
            return { type: 'answer', answer };
        } catch (error) {
            console.error('Error handling offer:', error);
            return null;
        }
    };

    const handleAnswer = async (answer, connectionID) => {
        try {
            await ID2Connection.current[connectionID].pc.setRemoteDescription(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleIceCandidate = async (iceCandidates, connectionID) => {
        try {
            for (const candidate of iceCandidates) {
                await ID2Connection.current[connectionID].pc.addIceCandidate(candidate);
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    };

    const createOffer = async (connectionID) => {
        try {
            const connection = await ID2Connection.current[connectionID].pc;
            const dataChannel = await connection.createDataChannel('chat');
            ID2Connection.current[connectionID].channel = dataChannel;
            setID2Connection(ID2Connection.current);

            dataChannel.onmessage = (event) => {
                ID2Connection.current[connectionID].messages.push({ sender: 'remote', message: event.data });
                setID2Connection(ID2Connection.current);
            };

            dataChannel.onopen = () => {
                console.log('Data channel opened!');
            };

            dataChannel.onclose = () => {
                console.log('Data channel closed!');
            };

            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            // Send the offer through the WebSocket
            return { type: 'offer', offer };
        } catch (error) {
            console.error('Error creating offer:', error);
            return null
        }
    };

    const checkIfConnectionOpen = (connectionID) => {
        return ID2Connection.current[connectionID] && ID2Connection.current[connectionID].channel && ID2Connection.current[connectionID].channel.readyState === 'open';
    };

    const sendP2PMessage = (connectionID, message) => {
        const channel = ID2Connection.current[connectionID].channel;
        channel.send(message);
        console.log('Sent message to peer:', message);
    };

    const [currentP2PConnectionID, setCurrentP2PConnectionID] = useState(0);

    const setShowP2PMessagesModal = (connectionID) => {
        if(checkIfConnectionOpen(connectionID)){ 
            setCurrentP2PConnectionID(connectionID);
        }else{
            alert('Connection is not open');
        }
    };

    const P2PCommunicationModel = () => {
        const [messages, setMessages] = useState([]);
        const [message, setMessage] = useState('');

        const handleSend = () => {
            sendP2PMessage(currentP2PConnectionID, message);
            setMessages([...messages, { sender: 'local', message: message }]);
            setMessage('');
        };

        const closeP2PConnectionModal = () => {
            setShowP2PMessagesModal(currentP2PConnectionID, false);
            setCurrentP2PConnectionID(0);
            setMessages([]);
            setMessage('');
        }

        return (
            <>
            {currentP2PConnectionID > 0 &&
                <div id="P2PMessagesModal" className="modal">
                    <div className="modal-content">
                        <span className="close-modal" onClick={()=>closeP2PConnectionModal()}>&times;</span>
                        <h2 id="addLoanModalTitle">Chat</h2>
                        <input type="text" value={message} onChange={(event) => setMessage(event.target.value)} />
                        <button onClick={handleSend}>Send</button>
                        <nav>
                            <ul>
                                {messages.map((msg, index) => (
                                    <li key={index}>{msg.sender}: {msg.message}</li>
                                ))}
                            </ul>
                            <ul>
                                {ID2Connection.current[currentP2PConnectionID].messages.map((msg, index) => (
                                    <li key={index}>{msg.sender}: {msg.message}</li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            }
            </>
        );
    };

    return (
        <CommunicationContext.Provider value={{OpenLanCommunicationIndicator ,CommunicationIndicator, get, post, put, del, fetchRequest, webSocketRequest, sendWebSocketMessage, closeWebSocket, establishSSEStream, establishP2PConnection, sendIceCandidate, closeP2PConnection, handleAnswer, handleIceCandidate, handleOffer, sendP2PMessage, createOffer, setShowP2PMessagesModal, P2PCommunicationModel, loading, error }}>
            {children}
        </CommunicationContext.Provider>
    );
};

export {CommunicationStateProvider, useCommunication};