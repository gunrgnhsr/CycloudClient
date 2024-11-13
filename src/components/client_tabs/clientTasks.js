// src/components/Client.js
import React, { useEffect, useState, useRef } from 'react';
import {useLoginState} from '../../providers/LoginStateProvider';
import { useCommunication } from '../../providers/CommunicationStateProvider';
import { getTotalHeight } from '../../utils/utils';
import TestTaskModal from './testTask';

    
function AddTask({tab, availableHeight}) {    
    const [doLocaly, setDoLocaly] = useState(false);
    const [tid, setTid] = useState(0);
    const [tasks, setTasks] = useState([]);

    // Compute task request state
    const [wasmCodeLocation, setWasmCodeLocation] = useState("/res/computeTasks/hello.wasm");
    const [functionName, setFunctionName] = useState("");
    const [numberOfArguments, setNumberOfArguments] = useState(0);
    const [numberOfOutputs, setNumberOfOutputs] = useState(1);


    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showTestTaskModal, setShowTestTaskModal] = useState(false);
    const { postAuthPost, postAuthPut, postAuthDel, postAuthGet , postAuthFetch , postAuthWebSocket } = useLoginState();
    const { establishSSEStream, establishP2PConnection , sendIceCandidate, closeP2PConnection, handleIceCandidate, createOffer, handleAnswer, sendWebSocketMessage, closeWebSocket, setShowP2PMessagesModal, P2PCommunicationModel } = useCommunication();

    const navRef = useRef(null);
    const [tableHeight, setTableHeight] = useState(availableHeight);

    const getTasks = async () => {
        await postAuthGet(`get-non-exclusive-tasks`, {})
            .then(response => {
                if (response.status === 200) {
                    setTasks(response.data);
                    console.log('Got user Tasks:', response.data);
                } else {
                    console.error('Failed to add Tasks:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error getting Tasks:', error);
            });
    }

    useEffect(() => {
        if(tab === 4){
            getTasks();
        }
    }, [tab]);

    const handleTaskInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'code_location': setWasmCodeLocation(value); break;
            case 'function_name': setFunctionName(value); break;
            case 'number_of_arguments': setNumberOfArguments(parseInt(value, 10)); break;
            case 'number_of_outputs': setNumberOfOutputs(parseInt(value, 10)); break;
            default: break;
        }
    };

    const handleAddTaskClick = () => {
        setShowAddTaskModal(true);
    };

    const closeAddTaskModal = () => {
        setShowAddTaskModal(false);
    };

    const postTask = async (task) => {
        await postAuthPost('add-user-task', task, {})
                .then(response => {
                    if (response.status === 201) {
                        getTasks();
                        console.log('Task added:', response.data);
                    } else {
                        console.error('Failed to add Task:', response.statusText);
                    }
                })
                .catch(error => {
                    console.error('Error adding Task:', error);
                });
    }

    const addTask = async () => {
        const response = await fetch(wasmCodeLocation);
        const wasmBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(wasmBuffer);
        const base64String = btoa(String.fromCharCode(...uint8Array));
        const newTask = { 
            code: base64String, 
            functionName: functionName,
            numberOfInputs: numberOfArguments,
            numberOfOutputs: numberOfOutputs,
        };
        if(doLocaly){
            newTask.tid = tid;
            setTid(prevTid=>prevTid + 1);
            setTasks(prevTasks => [...prevTasks, newTask]);
        } else {
            postTask(newTask);
        }
        closeAddTaskModal();
    };

    const uploadLocalTask = async () => {
        if (tasks.length > 0) {
            for (const task of tasks) {
                await postTask(task);
            }
        }
        setDoLocaly(false);
    }

    const removeUserTask = async (tid) => {
        if(doLocaly){
            setTasks(prevTasks => prevTasks.filter(task => task.tid !== tid));
            return;
        }
        await postAuthDel(`delete-user-task/${tid}`, {})
            .then(response => {
                if (response.status === 200) {
                    getTasks();
                    console.log('Task deleted:', response.data);
                } else {
                    console.error('Failed to delete Task:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting Task:', error);
            });
    }


    const changeExclusivity = async (tid, exclusive) => { 
        if(doLocaly){
            setTasks(prevTasks => prevTasks.map(task => task.tid === tid ? {...task, exclusive: !exclusive} : task));
            return;
        }
        await postAuthFetch(`update-task-exclusivity/${tid}` , 'POST', { exclusive: exclusive }, {})
            .then(async response => {
                if (response.status === 200) {
                    getTasks();
                    console.log('Task exclusivity updated:', response.data);
                }else {   
                    console.error('Error updating task exclusivity:');
                }
            }).catch(error => {
                console.error('Error:', error);
            }
        );  
    }

    const [currentTask, setCurrentTask] = useState(null);

    const handleTestTask = (task) => {
        setCurrentTask(task);
        setShowTestTaskModal(true);
    }

    useEffect(() => {
        const calculateTableHeight = () => {
            if(navRef.current){
                setTableHeight(availableHeight- getTotalHeight(navRef.current));
            }
        }

        calculateTableHeight();
        window.addEventListener('resize', calculateTableHeight);
        return () => window.removeEventListener('resize', calculateTableHeight);
    }, [navRef.current !== null ? getTotalHeight(navRef.current) : navRef ,availableHeight]);

    return (
        <>  
        <nav className='container' ref={navRef}>
            <h2>Available Tasks To Use</h2>
            <button className="cta-button" onClick={handleAddTaskClick}>Add Task</button>
            <button className='cta-button' style={{ backgroundColor: !doLocaly ? 'green' : 'red' }}  onClick={()=>{uploadLocalTask()}}>upload</button>
        </nav>
        <table style={{maxHeight: tableHeight}}>
            <thead>
                <tr>
                    <th>Name of function</th>
                    <th>Number of arguments</th>
                    <th>Number of outputs</th>
                    <th>Exclusivity</th>
                    <th>Test</th>
                    <th/>
                </tr>
            </thead>
            <tbody>
                {tasks.length > 0 && (
                    tasks.map((task, index) => (
                    <tr key={index}>
                    <td>{task.functionName}</td>
                    <td>{task.numberOfInputs}</td>
                    <td>{task.numberOfOutputs}</td>
                    <td><button className='cta-button' style={{ backgroundColor: task.exclusive ? 'green' : 'red' }}  onClick={()=>{changeExclusivity(task.tid,task.exclusive)}}>exclusive</button></td>
                    <td><button className='cta-button' onClick={()=>{handleTestTask(task)}}>Test</button></td>
                    <td><button className='cta-button' onClick={()=>{removeUserTask(task.tid)}}>Remove</button></td>
                    </tr>
                    ))
                )}
            </tbody>
        </table>
        {showAddTaskModal && (
            <div id="addTaskModal" className="modal">
                <div className="modal-content">
                    <span className="close-modal" onClick={closeAddTaskModal}>&times;</span>
                    <h2 id="addTaskModalTitle">Add Task</h2>
                    <p>Please ensure the Task follows the expected format:</p>
                    <ul>
                        <li>The code should be a valid WebAssembly (.wasm) file.</li>
                        <li>The function name should match the exported function in the WebAssembly module.</li>
                        <li>Export memory area under the name "memory"</li>
                        <li>Export where to write args under the name "input_start"</li>
                        <li>Expect to get for every arg one "i32" for the location in "memory" and one "i32" for the length</li>
                        <li>Export where you wrote the outputs in "memory" under the name "output_start"</li>
                        <li>Ensure the outputs set in memory are null terminated</li>
                        <li>Specify the correct number of arguments and outputs for the function.</li>
                    </ul>
                    <form onSubmit={(e) => { e.preventDefault(); addTask(); }}> {/* Form submission handler */}
                        <div>
                            <label htmlFor="code_location">Path to code:</label>
                            <input type="text" id="code_location" name="code_location" accept=".wasm" value={wasmCodeLocation} onChange={handleTaskInputChange} required />
                        </div>
                        <div>
                            <label htmlFor="function_name">Function name:</label>
                            <input type="text" id="function_name" name="function_name" value={functionName} onChange={handleTaskInputChange} required />
                        </div>
                        <div>
                            <label htmlFor="number_of_arguments">Number of Arguments:</label>
                            <input type="number" id="number_of_arguments" name="number_of_arguments" value={numberOfArguments} onChange={handleTaskInputChange} step="1" min="0" required />
                        </div>
                        <div>
                            <label htmlFor="number_of_outputs">Number of Arguments:</label>
                            <input type="number" id="number_of_outputs" name="number_of_outputs" value={numberOfOutputs} onChange={handleTaskInputChange} step="1" min="1" required />
                        </div>
                        <button type="submit">Add</button>
                    </form>
                </div>
            </div>
        )}
        {showTestTaskModal && <TestTaskModal currentTask={currentTask} setShowTestTaskModal={setShowTestTaskModal} />}
        </>
    );
}

export default AddTask;