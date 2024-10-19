// src/components/Footer.js
import React from 'react';

const Footer = React.forwardRef((props, ref) => {
      
      return (
        <footer ref={ref}>
            <p className="app-content" style={{ float: 'center' }}>&copy; 2024 ReCycloud. All rights reserved.</p>
        </footer>
      );
  });

export default Footer;