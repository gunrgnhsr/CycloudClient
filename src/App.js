import React from 'react';
import './styles.css'; // Import your global styles
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Client from './components/Client';
import Footer from './components/Footer';
import { useLoginState } from './components/clientLoginState';

// This is the main App component that will be rendered
function App() {
    // Get the login state
    const isLoggeIn = useLoginState();

    // Add an event listener to handle the closure of the site abruptly
    window.addEventListener('beforeunload', () => {
        localStorage.removeItem('ReCyCloudtoken');
    });

    return (
        <div className="app-container">
            {/* Header component */}
            <Header/>

            {/* Main content area */}
            <main className="app-main">
                {!(isLoggeIn) ? <LandingPage/> : <Client/>}
            </main>

            {/* Footer component */}
            <Footer />
        </div>
    );
}

export default App;