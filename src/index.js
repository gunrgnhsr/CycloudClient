import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import your main App component
import './styles.css';   // Import your global styles
import {LoginStateProvider} from './providers//LoginStateProvider';
import {CommunicationStateProvider} from './providers/CommunicationStateProvider';
import { WebWorkersProvider } from './providers/WebWorkersProvider';

// Render the App component into the 'root' element in index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode> 
        <WebWorkersProvider>
            <CommunicationStateProvider>
                <LoginStateProvider>
                    <App />
                </LoginStateProvider>
            </CommunicationStateProvider>
        </WebWorkersProvider>
    </React.StrictMode>
);