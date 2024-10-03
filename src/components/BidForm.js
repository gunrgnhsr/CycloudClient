// src/components/BidForm.js
import React, { useState } from 'react';

function BidForm() {
    const [resourceId, setResourceId] = useState('');
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        // Send bid data to your Go server
        fetch('/bids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resourceId, amount, duration })
        })
            .then(res => res.json())
            .then(data => console.log('Bid placed:', data))
            .catch(error => console.error('Error placing bid:', error));
    };

    return (
        <div>
            <h2>Place a Bid</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="resourceId">Resource ID:</label>
                    <input 
                        type="text" 
                        id="resourceId" 
                        value={resourceId} 
                        onChange={e => setResourceId(e.target.value)} 
                    />
                </div>   

                {/* ... input fields for amount and duration */}
                <button type="submit">Place Bid</button>
            </form>
        </div>
    );
}

export default BidForm;