import { useState } from 'react';
import { base64ToArrayBuffer } from '../../utils/utils';
import { useWebWorkers } from '../../providers/WebWorkersProvider';

const TestTaskModal = ({currentTask, setShowTestTaskModal}) => {
    const [args, setArgs] = useState(Array(currentTask.numberOfArguments).fill(''));
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const { executeWebWorker } = useWebWorkers();    

    
    const handleTaskResult = (resultsArray) => {
        setResults(resultsArray);
        setShowResults(true);
        console.log('Task Test Results:', resultsArray);
    }

    const taskTest = () => {
        const { code, functionName, numberOfOutputs } = currentTask;
        executeWebWorker(
            new URL('../../utils/workers/wasmWorker.js', import.meta.url), 
            { wasmBuffer: base64ToArrayBuffer(code), functionName: functionName, args: args, numberOfOutputs: numberOfOutputs }, 
            (message)=> { handleTaskResult([...message.data]) },
            (error) => { alert(error + ' Please check the console for more information.') }
        )
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