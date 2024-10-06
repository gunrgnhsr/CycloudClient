// src/components/LandingPage.js
import React from 'react';
import { useLoginState } from './clientLoginState';

function LandingPage() {
    
    const { LoginModel } = useLoginState();

    return (
        <div id="landingPage">
            <section className="landingPage">
                <h2>Share Computing Resources with Ease</h2>
                <p>Cycloud enables clients to rent and loan computing resources online, creating a collaborative ecosystem for efficient resource utilization.</p>
                <LoginModel/>
            </section>
        </div>
    );
}

export default LandingPage;