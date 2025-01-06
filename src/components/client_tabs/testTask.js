import { useState } from 'react';
import { base64ToArrayBuffer } from '../../utils/utils';
import { useWebWorkers } from '../../providers/WebWorkersProvider';
import { useP2PCommunication } from '../../providers/P2PCommunicationProvider';

function TestTaskModal({currentTask, setShowTestTaskModal, remoteConnectionID}){
    const [args, setArgs] = useState(Array(currentTask.numberOfArguments).fill(''));
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const { executeWebWorker } = useWebWorkers();    
    const { sendP2PCommand, getCommandResults } = useP2PCommunication();

    
    const handleTaskResult = (resultsArray) => {
        setResults([...resultsArray]);
        setShowResults(true);
        console.log('Task Test Results:', resultsArray);
    }

    const taskTest = () => {
        const { code, functionName, numberOfOutputs } = currentTask;
        let taskData = {
            wasmBuffer: code, 
            functionName: functionName, 
            args: args, 
            numberOfOutputs: numberOfOutputs 
        }
        if(remoteConnectionID === -1){
            taskData.wasmBuffer = base64ToArrayBuffer(code)
            executeWebWorker(
                new URL('../../utils/workers/wasmWorker.js', import.meta.url), 
                taskData, 
                (message)=> { handleTaskResult(message.data) },
                (error) => { alert(error + ' Please check the console for more information.') }
            )
        } else {
            sendP2PCommand(remoteConnectionID, taskData)
            getCommandResults(remoteConnectionID, handleTaskResult)
        }
    }

    const closeTestTaskModal = () => {
        setShowTestTaskModal(false);
        setResults([]);
        setShowResults(false);
    }

    const handleTaskInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            default:
                args.forEach((_, index) => {
                    if (name === `arg${index}`) {
                        setArgs(prevArgs => {
                            const newArgs = [...prevArgs];
                            newArgs[index] = value;
                            return newArgs;
                        });
                    }
                });
                break;
        }
    }

    return (
        <div id="testTaskModal" className="modal">
            <div className="modal-content">
                <span className="close-modal" onClick={closeTestTaskModal}>&times;</span>
                <h2 id="testTaskModalTitle">Test Task</h2>
                <p>Test the Task with the following arguments:</p>
                <form onSubmit={(e) => { e.preventDefault(); taskTest(); }}> {/* Form submission handler */}
                    {Array.from({ length: currentTask.numberOfInputs }).map((_, index) => (
                        <div key={index}>
                            <label htmlFor={`arg${index}`}>Argument {index + 1}:</label>
                            <input type="text" id={`arg${index}`} name={`arg${index}`} onChange={handleTaskInputChange} required />
                        </div>
                    ))}
                    <button type="submit">Test</button>
                </form>
                {showResults && (
                    <>
                    <h3>Results:</h3>
                    {results.map((result, index) => (
                        <div key={index}>
                            <p>Output {index + 1}: {result}</p>
                        </div>
                    ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default TestTaskModal;