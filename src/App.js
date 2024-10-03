import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css'; // Import your global styles
import ResourceList from './components/ResourceList'; // Import the ResourceList component
import BidForm from './components/BidForm'; // Import the BidForm component

// This is the main App component that will be rendered
function App() {
  return (
    <div className="app-container">
      {/* Header component */}
      <header className="app-header">
        <h1>Resource Exchange</h1>
      </header>

      {/* Main content area */}
      <main className="app-main">
        <ResourceList /> {/* Include the ResourceList component */}
        <BidForm /> {/* Include the BidForm component */}
      </main>

      {/* Footer component */}
      <footer className="app-footer">
        <p>&copy; 2023 Resource Exchange</p>
      </footer>
    </div>
  );
}

// Render the App component into the 'root' element in index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

export default App;