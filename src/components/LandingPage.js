// src/components/LandingPage.js
import React from 'react';

function LandingPage({enterLogin}) {
    return (
        <div id="landingPage">
            <section className="landingPage">
                <img src="/res/ReCyCloud_Logo.png" alt="Cycloud logo" className="logo" width="200" height="200"/>
                <h2>Share Computing Resources with Ease</h2>
                <p>Cycloud enables clients to rent and loan computing resources online, creating a collaborative ecosystem for efficient resource utilization.</p>
                <button className="cta-button" onClick={enterLogin}>Get Started</button>
            </section>
        </div>
    );
}

export default LandingPage;