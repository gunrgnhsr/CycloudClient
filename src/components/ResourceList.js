import React, { useState, useEffect } from 'react';

function ResourceList() {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        // Fetch resources from your Go server
        fetch('/resources')
            .then(res => res.json())
            .then(data => setResources(data))
            .catch(error => console.error('Error fetching resources:', error));
    }, []); // Empty dependency array ensures this runs once on component mount

    return (
        <div>
            <h2>Available Resources</h2>
            <ul>
                {resources.map(resource => (
                    <li key={resource.id}>
                        {/* Display resource details */}
                        <h3>{resource.name}</h3> 
                        <p>CPU: {resource.cpuCores}</p>
                        {/* ... other details */}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ResourceList;