// src/components/Client.js
import React, { useState, useRef, useEffect } from 'react';
import AddLoanRequest from './client_tabs/addLoanRequest.js';
import AddResource from './client_tabs/addResources.js';
import SeeLoanRequests from './client_tabs/seeLoanRequests.js';
import PersonalInfoModel from './client_tabs/personalInfo.js';
import { getTotalHeight } from '../utils/utils';


function Client({mainHeight}) {   
    const [tab, setTab] = useState(1);
    const [availableHeight, setAvailableHeight] = useState(mainHeight);
    const navRef = useRef(null);


    useEffect(() => {
        const calculateAvailableHeight = () => {
            if(navRef.current){
                setAvailableHeight(mainHeight - getTotalHeight(navRef.current));
            }
        }

        calculateAvailableHeight(); // Calculate on initial render

        window.addEventListener('resize', calculateAvailableHeight); // Recalculate on window resize
        return () => window.removeEventListener('resize', calculateAvailableHeight); // Clean up event listener
    }, [navRef.current !== null ? getTotalHeight(navRef.current) : navRef, mainHeight]);



    return (
            <>
                <nav ref={navRef}>
                    <div className="tab">
                        <button onClick={() => setTab(1)} className={tab === 1 ? 'active' : ''}>Rents</button>
                        <button onClick={() => setTab(2)} className={tab === 2 ? 'active' : ''}>Resources</button>
                        <button onClick={() => setTab(3)} className={tab === 3 ? 'active' : ''}>Requests</button>
                    </div>
                    <PersonalInfoModel/>
                </nav>
                {tab === 1 && <AddResource tab={tab} availableHeight={availableHeight}/>} 
                {tab === 2 && <AddLoanRequest tab={tab} availableHeight={availableHeight}/>}
                {tab === 3 && <SeeLoanRequests tab={tab} availableHeight={availableHeight}/>} 
            </>
        );
}

export default Client;