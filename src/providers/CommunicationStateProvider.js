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

    return (
        <CommunicationContext.Provider value={{OpenLanCommunicationIndicator ,CommunicationIndicator, get, post, put, del, fetchRequest, webSocketRequest, sendWebSocketMessage, closeWebSocket, establishSSEStream, loading, error }}>
            {children}
        </CommunicationContext.Provider>
    );
};

export {CommunicationStateProvider, useCommunication};