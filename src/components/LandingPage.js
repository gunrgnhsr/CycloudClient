// src/components/LandingPage.js
import React from 'react';
import {useLoginState} from '../providers/LoginStateProvider';
import { useCommunication } from '../providers/CommunicationStateProvider';

function LandingPage({mainHeight}) {
    
    const { LoginModel } = useLoginState();
    const { OpenLanCommunicationIndicator } = useCommunication();

    return (
        <main className="landingPage" style={{maxHeight: mainHeight}}>
            <h2>Share Computing Resources with Ease</h2>
            <p>Cycloud enables clients to rent and loan computing resources online, creating a collaborative ecosystem for efficient resource utilization.</p>
            <nav style={{justifyContent: 'center'}}>
                <LoginModel/>
                <OpenLanCommunicationIndicator/>
            </nav>
        </main>
    );
}

export default LandingPage;