// src/components/Client.js
import React, { useState } from 'react';
import {useLoginState} from './LoginStateProvider';
    
function Client() {
    const [loanRequests, setLoanRequests] = useState([]);
    const [cpuCores, setCpuCores] = useState(2);
    const [memory, setMemory] = useState(2);
    const [storage, setStorage] = useState(10);
    const [gpu, setGpu] = useState('RTX 3090');
    const [bandwidth, setBandwidth] = useState(1000);
    const [costPerHour, setCostPerHour] = useState(2);
    const [duration, setDuration] = useState(1);
    const [isRentTab, setIsRentTab] = useState(true);
    const [showAddResourceModal, setShowAddResourceModal] = useState(false);
    const { postAuthPost, postAuthPut, postAuthDel, postAuthGet } = useLoginState();

    const getResouces = async () => {
        await postAuthGet(`get-user-resources`, {})
            .then(response => {
                if (response.status === 200) {
                    setResources(response.data);
                    console.log('Got user Resources:', response.data);
                } else {
                    console.error('Failed to add resource:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error getting resource:', error);
            });
    }

    const [resources, setResources] = useState(getResouces);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
        case 'cpu_cores': setCpuCores(parseInt(value, 10)); break;
        case 'memory': setMemory(parseInt(value, 10)); break;
        case 'storage': setStorage(parseInt(value, 10)); break;
        case 'gpu': setGpu(value); break;
        case 'bandwidth': setBandwidth(parseInt(value, 10)); break;
        case 'cost_per_hour': setCostPerHour(parseFloat(value)); break;
        case 'duration': setDuration(parseInt(value, 10)); break;
        default: break;
        }
    };

    const handleAddResourceClick = (type) => {
        setShowAddResourceModal(true);
    };

    const closeAddResourceModal = () => {
        setShowAddResourceModal(false);
    };

  const addResource = async () => {
    const newResource = { 
        cpuCores: cpuCores, 
        memory: memory, 
        storage: storage, 
        gpu: gpu, 
        bandwidth: bandwidth, 
        costPerHour: costPerHour, 
        duration: duration 
    };
    if (isRentTab) {
        await postAuthPost('add-user-resources', newResource, {})
            .then(response => {
                if (response.status === 201) {
                    getResouces();
                    console.log('Resource added:', response.data);
                } else {
                    console.error('Failed to add resource:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error adding resource:', error);
            });
    } else {
        setLoanRequests([...loanRequests, newResource]);
    }
    // Clear the form fields
    // setCpuCores('');
    // setMemory('');
    // setStorage('');
    // setGpu('');
    // setBandwidth('');
    // setCostPerHour('');
    // setDuration('');

    closeAddResourceModal();
  };

    const removeUserResource = async (rid) => {
        await postAuthDel(`delete-user-resource/${rid}`, {})
            .then(response => {
                if (response.status === 200) {
                    getResouces();
                    console.log('Resource deleted:', response.data);
                } else {
                    console.error('Failed to delete resource:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting resource:', error);
            });
    }


  const changeAvailability = async (rid, available) => {
    await postAuthPut(`update-resource-availability/${rid}`, { available: available }, {})
        .then(response => {
            if (response.status === 200) {
                getResouces();
                console.log('Resource availability updated:', response.data);
            } else {
                console.error('Failed to update resource:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error updating resource:', error);
        });
  }

  return (
        <div className='container'>
            <div className="tab">
                <button onClick={() => setIsRentTab(true)} className={isRentTab ? 'active' : ''}>Rent</button>
                <button onClick={() => setIsRentTab(false)} className={!isRentTab ? 'active' : ''}>Loan</button>
            </div>
            <button className="add-resource-btn" onClick={handleAddResourceClick}>Request</button>
            {isRentTab ? (
                <div>
                    <h2>Available Computing Resources</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>CPU Cores</th>
                                <th>Memory (GB)</th>
                                <th>Storage (GB)</th>
                                <th>GPU</th>
                                <th>Bandwidth (Mbps)</th>
                                <th>Cost per Hour ($)</th>
                                <th>Available</th>
                                <th/>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.length > 0 && (
                                resources.map((resource, index) => (
                                <tr key={index}>
                                <td>{resource.cpuCores}</td>
                                <td>{resource.memory}</td>
                                <td>{resource.storage}</td>
                                <td>{resource.gpu}</td>
                                <td>{resource.bandwidth}</td>
                                <td>{resource.costPerHour}</td>
                                <td><button className='cta-button' style={{ backgroundColor: resource.available ? 'green' : 'red' }}  onClick={()=>{changeAvailability(resource.rid,resource.available)}}>available</button></td>
                                <td><button className='cta-button' onClick={()=>{removeUserResource(resource.rid)}}>Remove</button></td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>
                    <h2>Loan Requests</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>CPU Cores</th>
                            <th>Memory (GB)</th>
                            <th>Storage (GB)</th>
                            <th>GPU</th>
                            <th>Bandwidth (Mbps)</th>
                            <th>Duration (Hours)</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                            {loanRequests.length > 0 && (
                                loanRequests.map((resource, index) => (
                                <tr key={index}>
                                <td>{resource.cpuCores}</td>
                                <td>{resource.memory}</td>
                                <td>{resource.storage}</td>
                                <td>{resource.gpu}</td>
                                <td>{resource.bandwidth}</td>
                                <td>{resource.costPerHour}</td>
                                {/* <td><button className='cta-button' onClick={()=>{removeResource(index,true)}}>Remove</button></td> */}
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {showAddResourceModal && (
                <div id="addResourceModal" className="modal">
                    <div className="modal-content">
                        <span className="close-modal" onClick={closeAddResourceModal}>&times;</span>
                        <h2 id="addResourceModalTitle">{isRentTab ? 'Add Resource' : 'Add Loan Request'}</h2>
                        <form onSubmit={(e) => { e.preventDefault(); addResource(); }}> {/* Form submission handler */}
                            <div>
                            <label htmlFor="cpu_cores">CPU Cores:</label>
                            <input type="number" id="cpu_cores" name="cpu_cores" value={cpuCores} onChange={handleInputChange} required />
                            </div>
                            <div>
                            <label htmlFor="memory">Memory (GB):</label>
                            <input type="number" id="memory" name="memory" value={memory} onChange={handleInputChange} required />
                            </div>
                            <div>
                            <label htmlFor="storage">Storage (GB):</label>
                            <input type="number" id="storage" name="storage" value={storage} onChange={handleInputChange} required />
                            </div>
                            <div>
                            <label htmlFor="gpu">GPU:</label>
                            <input type="text" id="gpu" name="gpu" value={gpu} onChange={handleInputChange} />
                            </div>
                            <div>
                            <label htmlFor="bandwidth">Bandwidth (Mbps):</label>
                            <input type="number" id="bandwidth" name="bandwidth" value={bandwidth} onChange={handleInputChange} required />
                            </div>
                            {isRentTab && (
                            <div>
                                <label htmlFor="cost_per_hour">Cost per Hour ($):</label>
                                <input type="number" id="cost_per_hour" name="cost_per_hour" value={costPerHour} onChange={handleInputChange} step="0.01" required />
                            </div>
                            )}
                            {!isRentTab && (
                            <div>
                                <label htmlFor="duration">Duration (Hours):</label>
                                <input type="number" id="duration" name="duration" value={duration} onChange={handleInputChange} required />
                            </div>
                            )}
                            <button type="submit">Add</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Client;