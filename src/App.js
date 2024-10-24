import React, {useState, useRef, useEffect} from 'react';
import './styles.css'; // Import your global styles
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Client from './components/Client';
import Footer from './components/Footer';
import {useLoginState} from './providers/LoginStateProvider';
import { getTotalHeight } from './utils/utils';

// This is the main App component that will be rendered
function App() {
    // Get the login state
    const {isLoggedIn} = useLoginState();

    // Add an event listener to handle the closure of the site abruptly
    window.addEventListener('beforeunload', () => {
        localStorage.removeItem('ReCyCloudtoken');
    });

    const [mainHeight, setMainHeight] = useState(window.innerHeight);
    const footerRef = useRef(null);
    const headerRef = useRef(null);


    useEffect(() => {
        const calculateMainHeight = () => {
            if (footerRef.current && headerRef.current) {
                const footerHeight = footerRef.current.offsetHeight;
                const headerHeight = headerRef.current.offsetHeight;
                const windowHeight = window.innerHeight;
                const maxHeight = windowHeight - footerHeight - headerHeight;
                setMainHeight(maxHeight);
            }
        };

        calculateMainHeight(); // Calculate on initial render

        window.addEventListener('resize', calculateMainHeight); // Recalculate on window resize

        return () => window.removeEventListener('resize', calculateMainHeight); // Clean up event listener
    }, [footerRef.current !== null ? footerRef.current.offsetHeight: footerRef.current, headerRef.current !== null ? headerRef.current.offsetHeight : headerRef.current]);

    return (
        <div className="app-container">
            {/* Header component */}
            <Header ref={headerRef}/>

            {/* Main content area */}
            {!isLoggedIn ? <LandingPage/> : <Client mainHeight={mainHeight}/>}
            
            {/* Footer component */}
            <Footer ref={footerRef}/>
        </div>
    );
}

export default App;