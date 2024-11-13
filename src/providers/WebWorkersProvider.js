import React, { createContext, useContext, useState } from 'react';

const WebWorkersContext = createContext();

const useWebWorkers = () => {
    return useContext(WebWorkersContext);
};

const WebWorkersProvider = ({ children }) => {
    // Create a new Worker
    const [numberOfWorkers, setNumberOfWorkers] = useState(0);
    const maxNumberOfWorkers = 4;

    
    
    const executeWebWorker = async (workerURL, taskData, onMessage, onError) => {
        if (numberOfWorkers >= maxNumberOfWorkers) {
            console.error('Maximum number of workers reached');
            return null;
        }
        
        const handleWorkerClose = () => {
            console.log(`Worker ${workerURL} closed`);
            setNumberOfWorkers(prevNumberOfWorkers => prevNumberOfWorkers - 1);
        }
        
        const worker = new Worker(workerURL);

        worker.onopen = () => {
            console.log(`Worker ${workerURL} started`);
        }

        setNumberOfWorkers(prevNumberOfWorkers => prevNumberOfWorkers + 1);

        worker.onerror = (error) => {
            onError(error);
            handleWorkerClose();
            worker.terminate();
        }
        worker.onmessage = (message) => {
            onMessage(message);
            handleWorkerClose();
            worker.terminate();
        }
        worker.postMessage({ data: taskData });
    };
    
    return (
        <WebWorkersContext.Provider value={{executeWebWorker}}>
            {children}
        </WebWorkersContext.Provider>
    );
}

export { useWebWorkers, WebWorkersProvider };