// src/components/Header.js
import React from 'react';
import {useLoginState} from '../providers/LoginStateProvider';
import {useCommunication}  from '../providers/CommunicationStateProvider';


const Header = React.forwardRef((props, ref) => {
    const {LogoutModel} = useLoginState();
    const { CommunicationIndicator } = useCommunication();

    return (
      <header ref={ref}>
          <nav className="app-content">
              <CommunicationIndicator />
              <LogoutModel/>
          </nav>
      </header>
    );
});

export default Header;