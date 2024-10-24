import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebWorkers } from './WebWorkersProvider';
import axios from 'axios';

const CommunicationContext = createContext();

const useCommunication = () => {
    return useContext(CommunicationContext);
};

const CommunicationStateProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverUrl, setServerUrl] = useState('http://localhost:3001/'); // Set your server URL here
    const [loadingIterator, setLoadingIterator] = useState(0);
    const [isLan, setIsLan] = useState(false);
    const { postWorkerTask, createWebWorker } = useWebWorkers();

    const OpenLanCommunicationIndicator = () => {
        
        const changeServerUrl = () => {
            setServerUrl(isLan ? 'http://localhost:3001/' : 'http://192.168.50.46:3001/');
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
        console.log(`HTTP ${method} Request to ${serverUrl}${endpoint}`);
        if (data) {
            console.log('Request Data:', data);
        }
        if (config) {
            console.log('Request Config:', config);
        }
    };

    const logResponseDetails = (method, endpoint, response) => {
        console.log(`HTTP ${method} Response from ${serverUrl}${endpoint}`);
        console.log('Response:', response);
    }


    const get = async (endpoint, config) => {
        setLoading(true);
        try {
            logRequestDetails('get', endpoint, null, config);
            const response = await axios.get(`${serverUrl}${endpoint}`, config);
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
            const response = await axios.post(`${serverUrl}${endpoint}`, data, addContentType(config));
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
            const response = await axios.put(`${serverUrl}${endpoint}`, data, config);
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
            const response = await axios.delete(`${serverUrl}${endpoint}`, config);
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
            const response = await fetch(`${serverUrl}${endpoint}`, {
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
        <CommunicationContext.Provider value={{OpenLanCommunicationIndicator ,CommunicationIndicator, get, post, put, del, fetchRequest, establishSSEStream, loading, error }}>
            {children}
        </CommunicationContext.Provider>
    );
};

export {CommunicationStateProvider, useCommunication};