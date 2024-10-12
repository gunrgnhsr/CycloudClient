import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CommunicationContext = createContext();

const useCommunication = () => {
    return useContext(CommunicationContext);
};

const CommunicationStateProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverUrl] = useState('http://localhost:8080/'); // Set your server URL here
    const [loadingIterator, setLoadingIterator] = useState(0);

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
        console.log(`HTTP ${method.toUpperCase()} Request to ${serverUrl}${endpoint}`);
        if (data) {
            console.log('Request Data:', data);
        }
        if (config) {
            console.log('Request Config:', config);
        }
    };

    const logResponseDetails = (method, endpoint, response) => {
        console.log(`HTTP ${method.toUpperCase()} Response from ${serverUrl}${endpoint}`);
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
            await new Promise(resolve => setTimeout(resolve, 1000));/// to show the loading indicator
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

    return (
        <CommunicationContext.Provider value={{CommunicationIndicator, get, post, put, del, loading, error }}>
            {children}
        </CommunicationContext.Provider>
    );
};

export {CommunicationStateProvider, useCommunication};