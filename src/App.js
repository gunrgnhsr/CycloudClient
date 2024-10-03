import React, { useState } from 'react';
import './styles.css'; // Import your global styles
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import LoginModel from './components/LoginModel';
import Client from './components/Client';
import Footer from './components/Footer';

// This is the main App component that will be rendered




function App() {
    const [enteredLogin, setEnteredLogin] = useState(false)
    const [loggedIn , setLoggedIn] = useState(false);

    const enterLogin = () =>{
        console.log("enterLogin");
        setEnteredLogin(true);
    }

    const exitLogin = () =>{
        console.log("exitLogin");
        setEnteredLogin(false);
    }

    const successfulLogin = () =>{
        console.log("successfulLogin");
        setLoggedIn(true);
    }

    return (
        <div className="app-container">
            {/* Header component */}
            <Header />

            {/* Main content area */}
            <main className="app-main">
                {!loggedIn && <LandingPage enterLogin={enterLogin}/>}
                {enteredLogin && <LoginModel successfulLogin={successfulLogin} exitLogin={exitLogin}/>}
                {loggedIn && <Client />}
            </main>

            {/* Footer component */}
            <Footer />
        </div>
    );
}

export default App;