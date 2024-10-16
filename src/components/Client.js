// src/components/Client.js
import React, { useState } from 'react';
import AddLoanRequest from './client_tabs/addLoanRequest.js';
import AddResource from './client_tabs/addResources.js';
import SeeLoanRequests from './client_tabs/seeLoanRequests.js';

function Client() {   
    const [tab, setTab] = useState(1);

    return (
            <div className='container'>
                <div className="tab">
                    <button onClick={() => setTab(1)} className={tab === 1 ? 'active' : ''}>Rents</button>
                    <button onClick={() => setTab(2)} className={tab === 2 ? 'active' : ''}>Resources</button>
                    <button onClick={() => setTab(3)} className={tab === 3 ? 'active' : ''}>Requests</button>
                </div>
                {tab === 1 && <AddResource tab={tab}/>} 
                {tab === 2 && <AddLoanRequest tab={tab}/>}
                {tab === 3 && <SeeLoanRequests tab={tab}/>}    
            </div>
        );
}

export default Client;