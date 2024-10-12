// src/components/addLoanRequest.js
import React, { useEffect, useState } from 'react';
import {useLoginState} from '../LoginStateProvider';
    
function AddLoanRequest({tab}) {
    
    // Loan request state
    const [loanRequestRid, setLoanRequestRid] = useState(0);
    const [amount, setAmount] = useState(1);
    const [duration, setDuration] = useState(1);

    // Available resources state
    const [availableResources, setAvailableResources] = useState([]);
    const [lastAvailableResource, setLastAvailableResource] = useState("0");
    const [firstAvailableResource, setFirstAvailableResource] = useState("0");

    const [showAddLoanModal, setShowAddLoanModal] = useState(false);
    const { postAuthPost,  postAuthGet } = useLoginState();

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

    const handleLoanRequestClick = (rid) => {
        setLoanRequestRid(rid);
        setShowAddLoanModal(true);
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
        setShowAddLoanModal(false);
    };

  return (
    <>
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
        {showAddLoanModal && (
            <div id="addLoanModal" className="modal">
                <div className="modal-content">
                    <span className="close-modal" onClick={()=>setShowAddLoanModal(false)}>&times;</span>
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
    </>  
    );
}

export default AddLoanRequest;