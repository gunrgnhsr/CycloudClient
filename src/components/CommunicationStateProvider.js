import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const CommunicationContext = createContext();

export const useCommunication = () => {
    return useContext(CommunicationContext);
};

const CommunicationStateProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverUrl] = useState('http://localhost:8080/'); // Set your server URL here

    const logDetails = (method, endpoint, data, response, config) => {
        console.log(`HTTP ${method.toUpperCase()} Request to ${serverUrl}${endpoint}`);
        if (data) {
            console.log('Request Data:', data);
        }
        if (config) {
            console.log('Request Config:', config);
        }
        console.log('Response:', response);
    };

    const get = async (endpoint, config) => {
        setLoading(true);
        try {
            const response = await axios.get(`${serverUrl}${endpoint}`, config);
            setLoading(false);
            logDetails('get', endpoint, null, response, config);
            return response;
        } catch (err) {
            setLoading(false);
            setError(err);
            throw err;
        }
    };

    const post = async (endpoint, data, config) => {
        setLoading(true);
        try {
            const response = await axios.post(`${serverUrl}${endpoint}`, data, config);
            setLoading(false);
            logDetails('post', endpoint, data, response, config);
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
            const response = await axios.put(`${serverUrl}${endpoint}`, data, config);
            setLoading(false);
            logDetails('put', endpoint, data, response, config);
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
            const response = await axios.delete(`${serverUrl}${endpoint}`, config);
            setLoading(false);
            logDetails('delete', endpoint, null, response, config);
            return response;
        } catch (err) {
            setLoading(false);
            setError(err);
            throw err;
        }
    };

    return (
        <CommunicationContext.Provider value={{ get, post, put, del, loading, error }}>
            {children}
        </CommunicationContext.Provider>
    );
};

export default CommunicationStateProvider;