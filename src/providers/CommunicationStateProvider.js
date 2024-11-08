import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWebWorkers } from './WebWorkersProvider';
import axios from 'axios';
import { type } from '@testing-library/user-event/dist/type';
import { base64ToArrayBuffer } from '../utils/utils';

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
    const { executeWebWorker } = useWebWorkers();

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

    const processPeerMessage = (event, connectionID) => {
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
            ID2Connection.current[connectionID].receivedMessages.push({ sender: 'remote', message: message.message });
            setID2Connection(ID2Connection.current);
        } else if (message.type === 'runCommand') {
            executeWebWorker(
                new URL('../utils/workers/wasmWorker.js', import.meta.url), 
                { wasmBuffer: base64ToArrayBuffer(message.taskData.wasmBuffer), functionName: message.taskData.functionName, args: message.taskData.args }, 
                (result)=> {
                    sendP2PJSON(connectionID, { type: 'result', result: result.data});
                },
                (error) => {
                    sendP2PJSON(connectionID, { type: 'error', error: error });
                })
        } else if (message.type === 'error') {
            console.error('Error from peer:', message.error);
        } else if (message.type === 'result') {
            console.log('Result from peer:', message.result);
            ID2Connection.current[connectionID].commandResults.push({result: message.result});
        }
    }

    const establishP2PConnection = async (connectionID) => {        
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const pc = new RTCPeerConnection(configuration);

        ID2Connection.current = {
            ...ID2Connection.current, 
            [connectionID]: { pc: pc, channel: null, receivedMessages: [], sentMessages: [], commandResults: [], iceCandidates: [] }
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
                processPeerMessage(event, connectionID);
            }

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
                processPeerMessage(event, connectionID);
            }

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

    const sendP2PJSON = (connectionID, json) => {
        const channel = ID2Connection.current[connectionID].channel;
        const info = JSON.stringify(json)
        channel.send(info);
        console.log('Sent JSON to peer:', json);
    };

    const sendP2PMessage = (connectionID, message) => {
        ID2Connection.current[connectionID].sentMessages.push({ sender: 'local', message: message.message });
        sendP2PJSON(connectionID ,message);
    };

    const sendP2PCommand = async (connectionID, command) => {
        if(command.type === 'local'){
            const response = await fetch(command.path);
            const wasmBuffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(wasmBuffer);
            const base64String = btoa(String.fromCharCode(...uint8Array));
            sendP2PJSON(connectionID, {type: 'runCommand', taskData: {wasmBuffer: base64String, functionName: command.functionName, args: command.args} });
        }
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
        const [message, setMessage] = useState('');
        const [wasmFileLocation, setWasmFileLocation] = useState("/res/computeTasks/hello.wasm");
        const [sentMessages, setSentMessages] = useState([]);
        const [receivedMessages, setReceivedMessages] = useState([]);
        const [commandResults, setCommandResults] = useState([]);

        const handleSendMessage = () => {
            sendP2PMessage(currentP2PConnectionID, { type: 'message', message: message });
            setMessage('');
        };

        const handleSendCommand = () => {
            sendP2PCommand(currentP2PConnectionID, { type: 'local', path: wasmFileLocation, functionName: 'hello', args: ["yonatan"] });
        };

        const closeP2PConnectionModal = () => {
            setShowP2PMessagesModal(currentP2PConnectionID, false);
            setCurrentP2PConnectionID(0);
        }

        useEffect(() => {
            // Update the messages every second, maybe by having a state for new messages
            let interval
            if (currentP2PConnectionID > 0) {
                interval = setInterval(() => {
                        setSentMessages(ID2Connection.current[currentP2PConnectionID].sentMessages);
                        setReceivedMessages(ID2Connection.current[currentP2PConnectionID].receivedMessages);
                        setCommandResults(ID2Connection.current[currentP2PConnectionID].commandResults);
                    }
                , 1000);
            }
            return () => clearInterval(interval);
        }, [currentP2PConnectionID]);

        return (
            <>
            {currentP2PConnectionID > 0 &&
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