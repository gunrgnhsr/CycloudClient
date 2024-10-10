import React from 'react';
import './styles.css'; // Import your global styles
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Client from './components/Client';
import Footer from './components/Footer';
import {useLoginState} from './components/LoginStateProvider';

// This is the main App component that will be rendered
function App() {
    // Get the login state
    const {isLoggedIn} = useLoginState();

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
                {!isLoggedIn ? <LandingPage/> : <Client/>}
            </main>

            {/* Footer component */}
            <Footer />
        </div>
    );
}

export default App;