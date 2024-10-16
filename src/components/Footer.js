// src/components/Footer.js
import React from 'react';
import PersonalInfoModel from './client_tabs/personalInfo.js';

function Footer() {
  return (
      <footer>
          <div className="container">
              <p>&copy; 2024 ReCycloud. All rights reserved.</p>
              <PersonalInfoModel/>
          </div>
      </footer>
  );
}

export default Footer;