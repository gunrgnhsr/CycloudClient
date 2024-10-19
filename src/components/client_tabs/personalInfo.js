
import React, { useState } from 'react';
import { useLoginState } from '../LoginStateProvider';

function PersonalInfoModel() {
    const { postAuthGet, postAuthPost, isLoggedIn } = useLoginState();
    const [showPersonalInfo, setShowPersonalInfo] = useState(false);
    const [showAddCredits, setShowAddCredits] = useState(false);
    const [credit, setCredit] = useState(0);
    const [resources, setResources] = useState(0);
    const [rented, setRented] = useState(0);
    const [pendingLoanRequests, setPendingLoanRequests] = useState(0);
    const [loaned, setLoaned] = useState(0);
    const [addedCredits, setAddedCredits] = useState(0.1);

    const handleCreditsInputChange = (event) => {
        const { value } = event.target;
        setAddedCredits(parseFloat(value));
    };

    const addCredits = async () => {
        await postAuthPost(`add-credits`, {amount : addedCredits},{})
            .then(response => {
                if (response.status === 200) {
                    console.log('Credits added:', addedCredits);
                    setAddedCredits(0);
                    getPersonalInfo();
                    setShowAddCredits(false);
                } else {
                    console.error('Failed to add credits:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error adding credits:', error);
            });
    }
    
    const getPersonalInfo = async () => {
        await postAuthGet('get-info', {})
            .then(response => {
                if (response.status === 200) {
                    console.log('Got user:', response.data);
                    setCredit(response.data.credits);
                    setResources(response.data.resources);
                    setRented(response.data.activeResources);
                    setPendingLoanRequests(response.data.pendingBids);
                    setLoaned(response.data.activeLoans);
                } else {
                    console.error('Failed to get user:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error getting user:', error);
            });
    }

    const showUserPresonalInfo = async () => {
        getPersonalInfo();
        setShowPersonalInfo(true);
    }

    
    return (
        isLoggedIn && (
            <>
                <button className='cta-button' text-align='center' onClick={()=>{showUserPresonalInfo()}}>Status</button>
                {showPersonalInfo && (
                    <div id="personalInfoModel" className="modal">
                        <div className="modal-content">
                            <span className="close-modal" onClick={()=>setShowPersonalInfo(false)}>&times;</span>
                            <h2 id="personalInfoModel">Personal Status</h2>
                            <nav>
                                <label>Credits: {credit}</label>
                                <button className='cta-button' onClick={()=>setShowAddCredits(true)}>Add Credits</button>
                            </nav>
                            <div>
                                <label>Resources: {resources}</label>
                            </div>
                            <div>
                                <label>Resources actively rented: {rented}</label>
                            </div>
                            <div>
                                <label>Pending loan requests: {pendingLoanRequests}</label>
                            </div>
                            <div>
                                <label>Resources actively loaned: {loaned}</label>
                            </div>
                        </div>
                    </div>
                )}
                {showAddCredits && (
                    <div id="addCreditsModel" className="modal">
                        <div className="modal-content">
                            <span className="close-modal" onClick={()=>setShowAddCredits(false)}>&times;</span>
                            <h2 id="addCreditsModel">Add Credits</h2>
                            <form onSubmit={(e) => { e.preventDefault(); addCredits(); }}>
                                <div>
                                    <label htmlFor="amount">Amount of credits ($):</label>
                                    <input type="number" id="amount" name="amount" value={addedCredits} onChange={handleCreditsInputChange} step="0.01" min={0.01} required />
                                </div>
                                <button type="submit">Add</button>
                            </form>
                        </div>
                    </div>)}
            </>
        )
    );
}

export default PersonalInfoModel;