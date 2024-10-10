// src/components/Client.js
import React, { useState } from 'react';
import {useLoginState} from './LoginStateProvider';
    
function Client() {
    const [resources, setResources] = useState([]);
    const [loanRequests, setLoanRequests] = useState([]);
    const [cpuCores, setCpuCores] = useState('');
    const [memory, setMemory] = useState('');
    const [storage, setStorage] = useState('');
    const [gpu, setGpu] = useState('');
    const [bandwidth, setBandwidth] = useState('');
    const [costPerHour, setCostPerHour] = useState('');
    const [duration, setDuration] = useState('');
    const [isRentTab, setIsRentTab] = useState(true);
    const [showAddResourceModal, setShowAddResourceModal] = useState(false);

    const { postAuthPost, postAuthPut, postAuthDel, postAuthGet } = useLoginState();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
        case 'cpu_cores': setCpuCores(value); break;
        case 'memory': setMemory(value); break;
        case 'storage': setStorage(value); break;
        case 'gpu': setGpu(value); break;
        case 'bandwidth': setBandwidth(value); break;
        case 'cost_per_hour': setCostPerHour(value); break;
        case 'duration': setDuration(value); break;
        default: break;
        }
    };

    const handleAddResourceClick = (type) => {
        setShowAddResourceModal(true);
    };

    const closeAddResourceModal = () => {
        setShowAddResourceModal(false);
    };

  const addResource = () => {

    const newResource = { cpuCores, memory, storage, gpu, bandwidth, costPerHour, duration };
    if (isRentTab) {
        
        setResources([...resources, newResource]);
    } else {
        setLoanRequests([...loanRequests, newResource]);
    }
    // Clear the form fields
    setCpuCores('');
    setMemory('');
    setStorage('');
    setGpu('');
    setBandwidth('');
    setCostPerHour('');
    setDuration('');

    closeAddResourceModal();
  };

  const removeResource = (index, isRequest) => {
    if (isRequest) {
      const updatedRequests = [...loanRequests];
      updatedRequests.splice(index, 1);
      setLoanRequests(updatedRequests);
    } else {
      const updatedResources = [...resources];
      updatedResources.splice(index, 1);
      setResources(updatedResources);
    }
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
                                <td><button className='cta-button' onClick={()=>{removeResource(index,false)}}>Remove</button></td>
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
                                <td><button className='cta-button' onClick={()=>{removeResource(index,true)}}>Remove</button></td>
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