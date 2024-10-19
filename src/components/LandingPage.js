// src/components/LandingPage.js
import React from 'react';
import {useLoginState} from './LoginStateProvider';
import { useCommunication } from './CommunicationStateProvider';

function LandingPage({mainHeight}) {
    
    const { LoginModel } = useLoginState();
    const { OpenLanCommunicationIndicator } = useCommunication();

    return (
        <div id="landingPage" style={{maxHeight: mainHeight}}>
            <section className="landingPage">
                <h2>Share Computing Resources with Ease</h2>
                <p>Cycloud enables clients to rent and loan computing resources online, creating a collaborative ecosystem for efficient resource utilization.</p>
                <nav style={{justifyContent: 'center'}}>
                    <LoginModel/>
                    <OpenLanCommunicationIndicator/>
                </nav>
            </section>
        </div>
    );
}

export default LandingPage;