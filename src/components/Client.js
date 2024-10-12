// src/components/Client.js
import React, { useState } from 'react';
import {useLoginState} from './LoginStateProvider';
    
function Client() {
    
    // Resource request state
    const [cpuCores, setCpuCores] = useState(2);
    const [memory, setMemory] = useState(2);
    const [storage, setStorage] = useState(10);
    const [gpu, setGpu] = useState('RTX 3090');
    const [bandwidth, setBandwidth] = useState(1000);
    const [costPerHour, setCostPerHour] = useState(2);

    // Loan request state
    const [loanRequestResourceSpec, setLoanRequestResourceSpec] = useState({});
    const [loanRequests, setLoanRequests] = useState([]);
    const [loanRequestRid, setLoanRequestRid] = useState(0);
    const [amount, setAmount] = useState(1);
    const [duration, setDuration] = useState(1);

    // Available resources state
    const [availableResources, setAvailableResources] = useState([]);
    const [lastAvailableResource, setLastAvailableResource] = useState("0");
    const [firstAvailableResource, setFirstAvailableResource] = useState("0");

    const [tab, setTab] = useState(1);
    const [showAddResourceModal, setShowAddResourceModal] = useState(false);
    const [showAddLoanModal, setShowAddLoanModal] = useState(false);
    const [showResourceModel, setShowResourceModel] = useState(false);
    const { postAuthPost, postAuthPut, postAuthDel, postAuthGet } = useLoginState();

    const getLoanRequests = async () => {
        await postAuthGet(`get-loan-requests`, {})
            .then(response => {
                if (response.status === 200) {
                    setLoanRequests(response.data);
                    console.log('Got loan requests:', response.data);
                } else {
                    console.error('Failed to get loan requests:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error getting loan requests:', error);
            });
    }

    const removeUserLoanRequest = async (bid) => {
        await postAuthDel(`delete-loan-request/${bid}`, {})
            .then(response => {
                if (response.status === 200) {
                    getLoanRequests();
                    console.log('Loan request deleted:', response.data);
                } else {
                    console.error('Failed to delete loan request:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting loan request:', error);
            });
    }

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

    const getAvailableResources = async () => {
        await postAuthGet(`available-resources/${0}/${"next"}`, {}) ///${lastAvailableResource}/${"next"} change to this
            .then(response => {
                if (response.status === 200) {
                    setAvailableResources(response.data);
                    if (response.data.length > 0) {
                        setLastAvailableResource(response.data[response.data.length - 1].rid);
                        setFirstAvailableResource(response.data[0].rid);
                    }
                    console.log('Got loan requests:', response.data);
                } else {
                    console.error('Failed to get loan requests:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error getting loan requests:', error);
            });
    }

    const [resources, setResources] = useState(getResouces);

    const getTabData = (tabNum) => {
        if (tabNum === 1) {
            setTab(1);
            getResouces();
        } else if (tabNum === 2) {
            setTab(2);
            getAvailableResources()
        } else if (tabNum === 3) {
            setTab(3);
            getLoanRequests();
        }
    };

    const handleResourceInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'cpu_cores': setCpuCores(parseInt(value, 10)); break;
            case 'memory': setMemory(parseInt(value, 10)); break;
            case 'storage': setStorage(parseInt(value, 10)); break;
            case 'gpu': setGpu(value); break;
            case 'bandwidth': setBandwidth(parseInt(value, 10)); break;
            case 'cost_per_hour': setCostPerHour(parseFloat(value)); break;
            default: break;
        }
    };

    const handleLoanInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'duration': setDuration(parseInt(value, 10)); break;
            case 'amount': setAmount(parseFloat(value)); break;
            default: break;
        }
    };

    const ShowResourceSpecs = async (rid) => {
        setShowResourceModel(true);
        await postAuthGet(`get-resource/${rid}`, {})
            .then(response => {
                if (response.status === 200) {
                    console.log('Got resource:', response.data);
                    setLoanRequestResourceSpec(response.data);
                } else {
                    console.error('Failed to get resource:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error getting resource:', error);
            });
    }

    const closeResourceModel = () => {
        setShowResourceModel(false);
    }

    const handleLoanRequestClick = (rid) => {
        setLoanRequestRid(rid);
        setShowAddLoanModal(true);
    };

    const closeAddLoanModal = () => {
        setShowAddLoanModal(false);
    };

    const addLoan = async () => {
        const newLoanRequest = {
            rid: loanRequestRid,
            duration: duration,
            amount: amount
        };
        await postAuthPost('place-loan-request', newLoanRequest, {})
            .then(response => {
                if (response.status === 201) {
                    getAvailableResources();
                    console.log('Loan request added:', response.data);
                }
                else {
                    console.error('Failed to add loan request:', response.statusText);
                }
            })
        closeAddLoanModal();
    };

    const handleAddResourceClick = () => {
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
                <button onClick={() => getTabData(1)} className={tab === 1 ? 'active' : ''}>Rents</button>
                <button onClick={() => getTabData(2)} className={tab === 2 ? 'active' : ''}>Resources</button>
                <button onClick={() => getTabData(3)} className={tab === 3 ? 'active' : ''}>Requests</button>
            </div>
            {tab === 1 && (
                <div>
                    <button className="add-resource-btn" onClick={handleAddResourceClick}>Request</button>
                    <h2>My Computing Resources For Rent</h2>
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
            )} 
            {tab === 2 && (
                <div>
                    <h2>Available Computing Resources To Loan</h2>
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
                            {availableResources.length > 0 && (
                                availableResources.map((resource, index) => (
                                <tr key={index}>
                                <td>{resource.cpuCores}</td>
                                <td>{resource.memory}</td>
                                <td>{resource.storage}</td>
                                <td>{resource.gpu}</td>
                                <td>{resource.bandwidth}</td>
                                <td>{resource.costPerHour}</td>
                                <td><button className='cta-button' onClick={()=>{handleLoanRequestClick(resource.rid)}}>loan</button></td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {tab === 3 && (
                <div>
                    <h2>My Loan Requests</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Duration (Hours)</th>
                            <th>Amount ($)</th>
                            <th>Status</th>
                            <th>Resource</th>
                        </tr>
                        </thead>
                        <tbody>
                            {loanRequests.length > 0 && (
                                loanRequests.map((loan, index) => (
                                <tr key={index}>
                                <td>{loan.duration}</td>
                                <td>{loan.amount}</td>
                                <td>{loan.status}</td>
                                <td><button className='cta-button' onClick={()=>{ShowResourceSpecs(loan.rid)}}>show</button></td>
                                <td><button className='cta-button' onClick={()=>{removeUserLoanRequest(loan.bid)}}>remove</button></td>
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
                        <h2 id="addResourceModalTitle">Add Resource</h2>
                        <form onSubmit={(e) => { e.preventDefault(); addResource(); }}> {/* Form submission handler */}
                            <div>
                                <label htmlFor="cpu_cores">CPU Cores:</label>
                                <input type="number" id="cpu_cores" name="cpu_cores" value={cpuCores} onChange={handleResourceInputChange} required />
                            </div>
                            <div>
                                <label htmlFor="memory">Memory (GB):</label>
                                <input type="number" id="memory" name="memory" value={memory} onChange={handleResourceInputChange} required />
                            </div>
                            <div>
                                <label htmlFor="storage">Storage (GB):</label>
                                <input type="number" id="storage" name="storage" value={storage} onChange={handleResourceInputChange} required />
                            </div>
                            <div>
                                <label htmlFor="gpu">GPU:</label>
                                <input type="text" id="gpu" name="gpu" value={gpu} onChange={handleResourceInputChange} />
                            </div>
                            <div>
                                <label htmlFor="bandwidth">Bandwidth (Mbps):</label>
                                <input type="number" id="bandwidth" name="bandwidth" value={bandwidth} onChange={handleResourceInputChange} required />
                            </div>
                            <div>
                                <label htmlFor="cost_per_hour">Cost per Hour ($):</label>
                                <input type="number" id="cost_per_hour" name="cost_per_hour" value={costPerHour} onChange={handleResourceInputChange} step="0.01" required />
                            </div>
                            <button type="submit">Add</button>
                        </form>
                    </div>
                </div>
            )}
            {showAddLoanModal && (
                <div id="addLoanModal" className="modal">
                    <div className="modal-content">
                        <span className="close-modal" onClick={closeAddLoanModal}>&times;</span>
                        <h2 id="addLoanModalTitle">Add Loan Request</h2>
                        <form onSubmit={(e) => { e.preventDefault(); addLoan(); }}> {/* Form submission handler */}
                            <div>
                                <label htmlFor="amount">Amount ($):</label>
                                <input type="number" id="amount" name="amount" value={amount} onChange={handleLoanInputChange} required />
                            </div>
                            <div>
                                <label htmlFor="duration">duration (Hours):</label>
                                <input type="number" id="duration" name="duration" value={duration} onChange={handleLoanInputChange} required />
                            </div>
                            <button type="submit">Add</button>
                        </form>
                    </div>
                </div>
            )}
            {showResourceModel && (
                <div id="resourceModal" className="modal">
                    <div className="modal-content">
                        <span className="close-modal" onClick={closeResourceModel}>&times;</span>
                        <h2 id="resourceModalTitle">Add Resource</h2>
                        <div>
                            <label htmlFor="cpu_cores">CPU Cores: {loanRequestResourceSpec.cpuCores}</label>
                        </div>
                        <div>
                            <label htmlFor="memory">Memory (GB): {loanRequestResourceSpec.memory}</label>
                        </div>
                        <div>
                            <label htmlFor="storage">Storage (GB): {loanRequestResourceSpec.storage}</label>
                        </div>
                        <div>
                            <label htmlFor="gpu">GPU: {loanRequestResourceSpec.gpu}</label>
                        </div>
                        <div>
                            <label htmlFor="bandwidth">Bandwidth (Mbps): {loanRequestResourceSpec.bandwidth}</label>
                        </div>
                        <div>
                            <label htmlFor="cost_per_hour">Cost per Hour ($): {loanRequestResourceSpec.costPerHour}</label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Client;