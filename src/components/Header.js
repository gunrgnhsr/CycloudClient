// src/components/Header.js
import React from 'react';
import {useLoginState} from './LoginStateProvider';
import {useCommunication}  from './CommunicationStateProvider';


function Header() {
    const {LogoutModel} = useLoginState();
    const { CommunicationIndicator } = useCommunication();

    return (
      <header>
          <nav className="container">
              <CommunicationIndicator />
              <LogoutModel/>
          </nav>
      </header>
    );
}

export default Header;