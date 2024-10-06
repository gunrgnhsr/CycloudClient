// src/components/Header.js
import React from 'react';
import LogoutModel from './LogoutModel';

function Header() {
    return (
      <header>
          <nav className="container">
              <img src='./res/ReCyCloud_Logo.png' alt="Cycloud logo" className="logo" width="200" height="200"/>
              <LogoutModel/>
          </nav>
      </header>
    );
}

export default Header;