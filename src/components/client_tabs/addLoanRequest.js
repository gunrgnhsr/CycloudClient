// src/components/addLoanRequest.js
import React, { useEffect, useState, useRef } from 'react';
import {useLoginState} from '../../providers/LoginStateProvider';
import { useCommunication } from '../../providers/CommunicationStateProvider';
import { getTotalHeight } from '../../utils/utils';

function AddLoanRequest({tab, availableHeight}) {
    
    // Loan request state
    const [loanRequestRid, setLoanRequestRid] = useState(0);
    const [loanResourceCostPerMinute, setLoanResourceCostPerMinute] = useState(0);
    const [amount, setAmount] = useState(1);
    const [duration, setDuration] = useState(1);

    // Available resources state
    const [availableResources, setAvailableResources] = useState([]);
    const [lastAvailableResource, setLastAvailableResource] = useState("0");
    const [firstAvailableResource, setFirstAvailableResource] = useState("0");

    const [showAddLoanModal, setShowAddLoanModal] = useState(false);
    const { postAuthPost,  postAuthGet, postAuthFetch, postAuthWebSocket} = useLoginState();
    const { establishSSEStream, establishP2PConnection, sendIceCandidate , closeP2PConnection, handleIceCandidate, handleOffer, sendWebSocketMessage, closeWebSocket } = useCommunication();

    const h2Ref = useRef(null);
    const [tableHeight, setTableHeight] = useState(availableHeight);

    const [bidToWebWorker, setBidToWebWorker] = useState({});

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

    useEffect(() => {
        if(tab === 2){
            getAvailableResources();
        }
    }, [tab]);

    const handleLoanInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'duration': setDuration(parseInt(value, 10)); break;
            case 'amount': setAmount(parseFloat(value)); break;
            default: break;
        }
    };

    const handleLoanRequestClick = (rid, costPerMinute) => {
        setLoanRequestRid(rid);
        setLoanResourceCostPerMinute(costPerMinute);
        setAmount(costPerMinute);
        setShowAddLoanModal(true);
    };

    const addLoan = async (rid,amount,duration) => {
        const newLoanRequest = {
            RID: rid,
            Amount: amount,
            Duration: duration
        };
        await postAuthFetch('place-loan-request', 'POST', JSON.stringify(newLoanRequest), {})
            .then(async response => {
                if (response.status === 201) {
                    getAvailableResources();
                    setShowAddLoanModal(false);
                    console.log('Loan request added:', response.data);
                    await establishSSEStream(
                        response,
                        async (message) => {
                            if(message.data === 'bid is rejected'){
                                console.log('bid rejected because of: ', message.reason);
                            }else if(message.data === 'starting connection'){
                                await postAuthWebSocket(
                                    `accept-connection-offer/${rid}`, 
                                    async (rawMessage) => {
                                        const message = JSON.parse(rawMessage.data);
                                        if (message.type === 'offer') {
                                            console.log('starting connection with the loaner');
                                            await establishP2PConnection(rid);            
                                            const answer = await handleOffer(message.offer,rid);
                                            if(answer){
                                                await sendWebSocketMessage(rid,answer);
                                            } else {
                                                console.error('error occurred while handling offer');
                                            }
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
                                await closeP2PConnection(rid);
                                await closeWebSocket(rid);
                                console.log('ending connection with the loaner');
                            } else if(message.data === 'error occurred'){
                                console.error('error occurred: ', message.reason);
                            }
                            else {
                                console.log('unknown message: ', message.data);
                            }
                        }
                    );
                } else {
                    console.error('Failed to add loan request:', response.statusText);
                }
            }).catch(error => {
                if (error.status === 402 || error.status === 412) {
                    alert(error.response.data);
                    console.error('One of the precondition did not pass: ', error.response.data);
                }
                return false                            
            });
    }

    useEffect(() => {
        const calculateTableHeight = () => {
            if(h2Ref.current){
                setTableHeight(availableHeight-getTotalHeight(h2Ref.current));
            }
        }

        calculateTableHeight();
        window.addEventListener('resize', calculateTableHeight);
        return () => window.removeEventListener('resize', calculateTableHeight);
    }, [h2Ref.current !== null ? getTotalHeight(h2Ref.current) : h2Ref ,availableHeight]);

    return (
    <>
    <h2 ref={h2Ref}>Available Computing Resources To Loan</h2>
    <table style={{maxHeight: tableHeight}}>
        <thead>
        <tr>
            <th>CPU Cores</th>
            <th>Memory (GB)</th>
            <th>Storage (GB)</th>
            <th>GPU</th>
            <th>Bandwidth (Mbps)</th>
            <th>Cost ($pm)</th>
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
                <td><button className='cta-button' onClick={()=>{handleLoanRequestClick(resource.rid, resource.costPerHour)}}>loan</button></td>
                </tr>
                ))
            )}
        </tbody>
    </table>
    {showAddLoanModal && (
        <div id="addLoanModal" className="modal">
            <div className="modal-content">
                <span className="close-modal" onClick={()=>setShowAddLoanModal(false)}>&times;</span>
                <h2 id="addLoanModalTitle">Add Loan Request</h2>
                <form onSubmit={(e) => { e.preventDefault(); addLoan(loanRequestRid,amount,duration); }}> {/* Form submission handler */}
                    <div>
                        <label htmlFor="amount">Amount ($):</label>
                        <input type="number" id="amount" name="amount" value={amount} onChange={handleLoanInputChange} step="0.01" min={loanResourceCostPerMinute}  required />
                    </div>
                    <div>
                        <label htmlFor="duration">duration (Minutes):</label>
                        <input type="number" id="duration" name="duration" value={duration} onChange={handleLoanInputChange} step="1" min="1" required />
                    </div>
                    <button type="submit">Add</button>
                </form>
            </div>
        </div>
    )}
    </>  
    );
}

export default AddLoanRequest;