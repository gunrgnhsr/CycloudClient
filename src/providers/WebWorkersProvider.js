import React, { createContext, useContext, useState } from 'react';

const WebWorkersContext = createContext();

const useWebWorkers = () => {
    return useContext(WebWorkersContext);
};

const WebWorkersProvider = ({ children }) => {
    // Create a new Worker
    const [numberOfWorkers, setNumberOfWorkers] = useState(0);
    const maxNumberOfWorkers = 4;
    
    const executeWebWorker = (workerURL, taskData, onMessage, onError) => {
        if (numberOfWorkers >= maxNumberOfWorkers) {
            console.error('Maximum number of workers reached');
            return null;
        }
        
        const worker = new Worker(workerURL);

        worker.onopen = () => {
            console.log(`Worker ${workerURL} started`);
        }

        worker.onclose = () => {
            console.log(`worker ${workerURL} closed`);
            setNumberOfWorkers(prevNumberOfWorkers => prevNumberOfWorkers - 1);
        }

        setNumberOfWorkers(prevNumberOfWorkers => prevNumberOfWorkers + 1);

        worker.onerror = onError;
        worker.onmessage = onMessage;
        worker.postMessage({ data: taskData });
    };
    
    return (
        <WebWorkersContext.Provider value={{executeWebWorker}}>
            {children}
        </WebWorkersContext.Provider>
    );
}

export { useWebWorkers, WebWorkersProvider };