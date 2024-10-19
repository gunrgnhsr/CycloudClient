// src/components/Client.js
import React, { useEffect, useState, useRef } from 'react';
import {useLoginState} from '../LoginStateProvider';
import { getTotalHeight } from '../../utils/utils';

function SeeLoanRequests({tab, availableHeight}) {

    const [loanRequestResourceSpec, setLoanRequestResourceSpec] = useState({});
    const [loanRequests, setLoanRequests] = useState([]);

    const [showResourceModel, setShowResourceModel] = useState(false);
    const { postAuthDel, postAuthGet } = useLoginState();

    const h2Ref = useRef(null);
    const [tableHeight, setTableHeight] = useState(availableHeight);

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

    useEffect(() => {
        if(tab === 3){
            getLoanRequests();
        }
    }, [tab]);

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

    useEffect(() => {
        const calculateTableHeight = () => {
            if(h2Ref.current){
                setTableHeight(availableHeight- getTotalHeight(h2Ref.current));
            }
        }

        calculateTableHeight();
        window.addEventListener('resize', calculateTableHeight);
        return () => window.removeEventListener('resize', calculateTableHeight);
    }, [h2Ref.current !== null ? getTotalHeight(h2Ref.current) : h2Ref ,availableHeight]);

    return (
        <>
        <h2 ref={h2Ref}>My Loan Requests</h2>
        <table style={{maxHeight: tableHeight}}>
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
        </>
    );
}

export default SeeLoanRequests;