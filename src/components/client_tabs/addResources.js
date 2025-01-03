// src/components/Client.js
import React, { useEffect, useState, useRef } from 'react';
import {useLoginState} from '../../providers/LoginStateProvider';
import { useCommunication } from '../../providers/CommunicationStateProvider';
import { getTotalHeight } from '../../utils/utils';
    
function AddResource({tab, availableHeight}) {    
    const [resources, setResources] = useState([]);

    // Resource request state
    const [cpuCores, setCpuCores] = useState(2);
    const [memory, setMemory] = useState(2);
    const [storage, setStorage] = useState(10);
    const [gpu, setGpu] = useState('RTX 3090');
    const [bandwidth, setBandwidth] = useState(1000);
    const [costPerHour, setCostPerHour] = useState(2);

    const [showAddResourceModal, setShowAddResourceModal] = useState(false);
    const { postAuthPost, postAuthPut, postAuthDel, postAuthGet , postAuthFetch , postAuthWebSocket } = useLoginState();
    const { establishSSEStream, establishP2PConnection , sendIceCandidate, closeP2PConnection, handleIceCandidate, createOffer, handleAnswer, sendWebSocketMessage, closeWebSocket, setShowP2PMessagesModal, P2PCommunicationModel } = useCommunication();

    const [ridToWebWorker, setRidToWebWorker] = useState({});

    const navRef = useRef(null);
    const [tableHeight, setTableHeight] = useState(availableHeight);

    const getResources = async () => {
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

    useEffect(() => {
        if(tab === 1){
            getResources();
        }
    }, [tab]);

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
        };
        await postAuthPost('add-user-resources', newResource, {})
            .then(response => {
                if (response.status === 201) {
                    getResources();
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
                    getResources();
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
        await postAuthFetch(`update-resource-availability/${rid}` , 'POST', { available: available }, {})
            .then(async response => {
                if (response.status === 200) {
                    getResources();
                    console.log('Resource availability updated:', response.data);
                    await establishSSEStream(
                        response,
                        async (message) => {
                            if(message.data === 'no bids for resource'){
                                getResources();
                                console.log('No bids for resource: ', rid);
                            }else if(message.data === 'starting connection'){
                                await postAuthWebSocket(
                                    `make-connection-offer/${rid}`, 
                                    async (rawMessage) => {
                                        const message = JSON.parse(rawMessage.data);
                                        if (message.type === 'start') {
                                            console.log('starting connection with the loaner');
                                            await establishP2PConnection(rid);                                
                                            const offer = await createOffer(rid);
                                            if (offer) {
                                                await sendWebSocketMessage(rid, offer);
                                            } else {
                                                console.error('error occurred while creating offer');
                                            }
                                        } else if (message.type === 'answer') {
                                            await handleAnswer(message.answer, rid);
                                            await sendIceCandidate(rid, sendWebSocketMessage);   
                                        } else if (message.type === 'iceCandidates') {
                                            await handleIceCandidate(message.iceCandidates,rid);
                                            await sendIceCandidate(rid, sendWebSocketMessage);
                                        } else if (message.error) {
                                            console.error('error occurred: ', message.error);
                                        } else {
                                            console.log('unknown message: ', message);
                                        }
                                    },
                                    rid,
                                    (error) => {
                                        console.error('Error during WebSocket:', error);
                                    }
                                );
                            } else if(message.data === 'connection ended'){
                                getResources();
                                await closeP2PConnection(rid);
                                await closeWebSocket(rid);
                                console.log('ending connection with the loaner');
                            }else {
                                console.log('unknown message: ', message.data);
                            }
                        }
                    );
                }else {   
                    console.error('Error updating resource availability:');
                }
            }).catch(error => {
                console.error('Error:', error);
            }
        );  
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
            <h2>My Computing Resources For Rent</h2>
            <button className="cta-button" onClick={handleAddResourceClick}>Add Resource</button>
        </nav>
        <table style={{maxHeight: tableHeight}}>
            <thead>
                <tr>
                    <th>CPU Cores</th>
                    <th>Memory (GB)</th>
                    <th>Storage (GB)</th>
                    <th>GPU</th>
                    <th>Bandwidth (Mbps)</th>
                    <th>Cost ($pm)</th>
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
                    <td><button className='cta-button' style={{ backgroundColor: resource.computing ? 'green' : 'red' }} onClick={()=>{setShowP2PMessagesModal(resource.rid)}}>messages</button></td>
                    <td><button className='cta-button' onClick={()=>{removeUserResource(resource.rid)}}>Remove</button></td>
                    </tr>
                    ))
                )}
            </tbody>
        </table>
        {showAddResourceModal && (
            <div id="addResourceModal" className="modal">
                <div className="modal-content">
                    <span className="close-modal" onClick={closeAddResourceModal}>&times;</span>
                    <h2 id="addResourceModalTitle">Add Resource</h2>
                    <form onSubmit={(e) => { e.preventDefault(); addResource(); }}> {/* Form submission handler */}
                        <div>
                            <label htmlFor="cpu_cores">CPU Cores:</label>
                            <input type="number" id="cpu_cores" name="cpu_cores" value={cpuCores} onChange={handleResourceInputChange} step="1" min="1" required />
                        </div>
                        <div>
                            <label htmlFor="memory">Memory (GB):</label>
                            <input type="number" id="memory" name="memory" value={memory} onChange={handleResourceInputChange} step="1" min="1" required />
                        </div>
                        <div>
                            <label htmlFor="storage">Storage (GB):</label>
                            <input type="number" id="storage" name="storage" value={storage} onChange={handleResourceInputChange} step="1" min="1" required />
                        </div>
                        <div>
                            <label htmlFor="gpu">GPU:</label>
                            <input type="text" id="gpu" name="gpu" value={gpu} onChange={handleResourceInputChange} />
                        </div>
                        <div>
                            <label htmlFor="bandwidth">Bandwidth (Mbps):</label>
                            <input type="number" id="bandwidth" name="bandwidth" value={bandwidth} onChange={handleResourceInputChange} step="1" min="1" required />
                        </div>
                        <div>
                            <label htmlFor="cost_per_hour">Cost ($pm):</label>
                            <input type="number" id="cost_per_hour" name="cost_per_hour" value={costPerHour} onChange={handleResourceInputChange} step="0.01" min="0.01" required />
                        </div>
                        <button type="submit">Add</button>
                    </form>
                </div>
            </div>
        )}
        <P2PCommunicationModel/>
        </>
    );
}

export default AddResource;