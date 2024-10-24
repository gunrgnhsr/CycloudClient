import React, { createContext, useContext, useState } from 'react';

const WebWorkersContext = createContext();

const useWebWorkers = () => {
    return useContext(WebWorkersContext);
};

const WebWorkersProvider = ({ children }) => {
    // Create a new Worker
    const [numberOfWorkers, setNumberOfWorkers] = useState(0);
    const maxNumberOfWorkers = 4;

    // Send a message to the worker with the function to execute
    const postWorkerTask = (myWorker, fn, data, onMessage, onError) => {
        myWorker.onerror = onError;
        myWorker.onmessage = onMessage;
        myWorker.postMessage({ type: 'runFunction', fn: fn, data: data });
    };
    
    const createWebWorker = () => {
        if (numberOfWorkers >= maxNumberOfWorkers) {
            console.error('Maximum number of workers reached');
            return;
        }
        
        const worker = new Worker('myWorker.js');

        worker.onopen = () => {
            console.log(`Worker ${worker} started`);
        }

        worker.onclose = () => {
            console.log(`worker ${worker} closed`);
        }

        setNumberOfWorkers(numberOfWorkers => numberOfWorkers + 1);

        return worker;
    };
    
    return (
        <WebWorkersContext.Provider value={{createWebWorker, postWorkerTask}}>
            {children}
        </WebWorkersContext.Provider>
    );
}

export { useWebWorkers, WebWorkersProvider };