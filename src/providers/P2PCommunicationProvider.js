import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { base64ToArrayBuffer } from '../utils/utils';
import { useLoginState } from './LoginStateProvider';
import { useWebWorkers } from './WebWorkersProvider';
import { useCommunication } from './CommunicationStateProvider';

const P2PCommunicationContext = createContext();

const useP2PCommunication = () => {
    return useContext(P2PCommunicationContext);
};

const P2PCommunicationStateProvider = ({ children }) => {

    const ID2Connection = useRef({});
    const { postAuthGet,postAuthWebSocket } = useLoginState();
    const { executeWebWorker } = useWebWorkers();
    const { sendWebSocketMessage, closeWebSocket } = useCommunication();

    const makeAConnectionOffer = async (connectionID, setP2PConnectionEstablished) => {
        await postAuthWebSocket(
            `make-connection-offer/${connectionID}`, 
            async (rawMessage) => {
                const message = JSON.parse(rawMessage.data);
                if (message.type === 'start') {
                    console.log('starting connection with the loaner');
                    await establishP2PConnection(connectionID);
                    await setP2PConnectionEstablished(true);                                
                    const offer = await createOffer(connectionID);
                    if (offer) {
                        await sendWebSocketMessage(connectionID, offer);
                    } else {
                        console.error('error occurred while creating offer');
                    }
                } else if (message.type === 'answer') {
                    await handleAnswer(message.answer, connectionID);
                    await sendIceCandidate(connectionID);   
                } else if (message.type === 'iceCandidates') {
                    await handleIceCandidate(message.iceCandidates,connectionID);
                    await sendIceCandidate(connectionID);
                } else if (message.error) {
                    console.error('error occurred: ', message.error);
                } else {
                    console.log('unknown message: ', message);
                }
            },
            connectionID,
            (error) => {
                console.error('Error during WebSocket:', error);
            }
        );
    }

    const waitForAConnectionOffer = async (connectionID) => {
        await postAuthWebSocket(
            `accept-connection-offer/${connectionID}`, 
            async (rawMessage) => {
                const message = JSON.parse(rawMessage.data);
                if (message.type === 'offer') {
                    console.log('starting connection with the loaner');
                    await establishP2PConnection(connectionID);            
                    const answer = await handleOffer(message.offer,connectionID);
                    if(answer){
                        await sendWebSocketMessage(connectionID,answer);
                    } else {
                        console.error('error occurred while handling offer');
                    }
                } else if (message.type === 'iceCandidates') {
                    await handleIceCandidate(message.iceCandidates,connectionID);
                    await sendIceCandidate(connectionID);
                } else if (message.error) {
                    console.error('error occurred: ', message.error);
                } else {
                    console.log('unknown message: ', message);
                }
            },
            connectionID,
            (error) => {
                console.error('Error during WebSocket:', error);
            }
        );
    }

    const establishP2PConnection = async (connectionID) => {
        if(!ID2Connection.current[connectionID]){
            const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
            const pc = new RTCPeerConnection(configuration);
            ID2Connection.current = {
                ...ID2Connection.current,
                [connectionID]: { pc: pc, channel: null, receivedMessages: [], sentMessages: [], commandResults: [], iceCandidates: [] }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate){
                    ID2Connection.current[connectionID].iceCandidates.push(event.candidate);
                }
            };
    
            pc.ondatachannel = (event) => {
                const receivedChannel = event.channel;
                ID2Connection.current[connectionID].channel = receivedChannel;
    
                receivedChannel.onmessage = (event) => {
                    processPeerMessage(event, connectionID);
                }
    
                receivedChannel.onopen = () => {
                    console.log('Data channel opened!');
                };
    
                receivedChannel.onclose = () => {
                    console.log('Data channel closed!');
                };
            };
        };
    }

    const sendIceCandidate = async (connectionID) => {
        if(ID2Connection.current[connectionID] && ID2Connection.current[connectionID].iceCandidates){
            await sendWebSocketMessage(connectionID ,{type: "iceCandidates", iceCandidates: ID2Connection.current[connectionID].iceCandidates});
        }
    }

    const closeP2PConnection = (connectionID) => {
        if (ID2Connection.current[connectionID] && ID2Connection.current[connectionID].pc) {
            ID2Connection.current[connectionID].pc.close();
            if(ID2Connection.current[connectionID].channel) ID2Connection.current[connectionID].channel.close();
            delete ID2Connection.current[connectionID];
        }
    }
 
    const handleOffer = async (offer, connectionID) => {
        try {
            const connection = ID2Connection.current[connectionID].pc;
            await connection.setRemoteDescription(offer);
            const answer = await connection.createAnswer();
            await connection.setLocalDescription(answer); 
            return { type: 'answer', answer };
        } catch (error) {
            console.error('Error handling offer:', error);
            return null;
        }
    };

    const handleAnswer = async (answer, connectionID) => {
        try {
            await ID2Connection.current[connectionID].pc.setRemoteDescription(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleIceCandidate = async (iceCandidates, connectionID) => {
        try {
            for (const candidate of iceCandidates) {
                await ID2Connection.current[connectionID].pc.addIceCandidate(candidate);
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    };

    const createOffer = async (connectionID) => {
        try {
            const connection = await ID2Connection.current[connectionID].pc;
            const dataChannel = await connection.createDataChannel('chat');
            ID2Connection.current[connectionID].channel = dataChannel;
            dataChannel.onmessage = (event) => {
                processPeerMessage(event, connectionID);
            }

            dataChannel.onopen = () => {
                console.log('Data channel opened!');
            };

            dataChannel.onclose = () => {
                console.log('Data channel closed!');
            };

            const offer = await connection.createOffer();
            await connection.setLocalDescription(offer);
            // Send the offer through the WebSocket
            return { type: 'offer', offer };
        } catch (error) {
            console.error('Error creating offer:', error);
            return null
        }
    };


    const checkIfConnectionOpen = (connectionID) => {
        return ID2Connection.current[connectionID] && ID2Connection.current[connectionID].channel && ID2Connection.current[connectionID].channel.readyState === 'open';
    };

    const processPeerMessage = (event, connectionID) => {
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
            console.log('Received message from peer:', message.message);
            ID2Connection.current[connectionID].receivedMessages.push({ sender: 'remote', message: message.message });
            if(ID2Connection.current[connectionID].UIReceivedMessages){
                ID2Connection.current[connectionID].UIReceivedMessages(ID2Connection.current[connectionID].receivedMessages);
            }
        } else if (message.type === 'runCommand') {
            executeWebWorker(
                new URL('../utils/workers/wasmWorker.js', import.meta.url), 
                { wasmBuffer: base64ToArrayBuffer(message.taskData.wasmBuffer), functionName: message.taskData.functionName, args: message.taskData.args, numberOfOutputs: message.taskData.numberOfOutputs }, 
                (result)=> {
                    sendP2PJSON(connectionID, { type: 'result', result: result.data});
                },
                (error) => {
                    sendP2PJSON(connectionID, { type: 'error', error: error });
                })
        } else if (message.type === 'result') {
            console.log('Result from peer:', message.result);
            ID2Connection.current[connectionID].commandResults.push(message.result);
            if(ID2Connection.current[connectionID].UICommandResults){
                ID2Connection.current[connectionID].UICommandResults(ID2Connection.current[connectionID].commandResults);
            }
        } else if (message.type === 'error') {
            console.error('Error from peer:', message.error);
        }
    }

    const sendP2PJSON = (connectionID, json) => {
        const channel = ID2Connection.current[connectionID].channel;
        const info = JSON.stringify(json)
        channel.send(info);
        console.log('Sent JSON to peer:', json);
    };

    const sendP2PMessage = (connectionID, message) => {
        if(!checkIfConnectionOpen(connectionID)){
            alert('Connection is not open!');
            return;
        }

        ID2Connection.current[connectionID].sentMessages.push({ sender: 'local', message: message.message });
        sendP2PJSON(connectionID ,message);
    };

    const sendP2PCommand = async (connectionID, taskData) => {
        if(!checkIfConnectionOpen(connectionID)){
            alert('Connection is not open!');
            return;
        }
        sendP2PJSON(connectionID, {type: 'runCommand', taskData });
    };

    const getReceivedMessages = (connectionID, setReceivedMessages) => {
        if(ID2Connection.current[connectionID]){
            ID2Connection.current[connectionID].UIReceivedMessages = setReceivedMessages;
            setReceivedMessages(ID2Connection.current[connectionID].receivedMessages);
        }else {
            alert('Connection not exist!');
        }
    };

    const getSentMessages = (connectionID, setSentMessages) => {
        if(ID2Connection.current[connectionID]){
            ID2Connection.current[connectionID].UISentMessages = setSentMessages;
            setSentMessages(ID2Connection.current[connectionID].sentMessages);
        }else {
            alert('Connection not exist!');
        }
    };

    const getCommandResults = (connectionID, setCommandResults) => {
        if(ID2Connection.current[connectionID]){
            ID2Connection.current[connectionID].UICommandResults = setCommandResults;
            setCommandResults(ID2Connection.current[connectionID].commandResults);
        }else {
            alert('Connection not exist!');
        }
    };

    useEffect(() => {
        postAuthGet('get-activly-rented-resources', {}).then(response => {
            if (response.status === 200) {
                console.log('Currently activly Rented Resources: ', response.data);
                for (const resource of response.data) {
                    waitForAConnectionOffer(resource.rid);
                }
            } else {
                console.error('Failed to get activly Rented Resources:', response.statusText);
            }
        }).catch(error => {
            console.error('Error getting activly Rented Resources:', error);
        });

        return () => {
            for (const connectionID in ID2Connection.current) {
                closeP2PConnection(connectionID);
                closeWebSocket(connectionID);
            }
        }
    }, []);

    return (
        <P2PCommunicationContext.Provider value={{ establishP2PConnection, makeAConnectionOffer, waitForAConnectionOffer, sendIceCandidate, closeP2PConnection, handleAnswer, handleIceCandidate, handleOffer, sendP2PMessage, sendP2PCommand, createOffer, checkIfConnectionOpen, getReceivedMessages, getSentMessages, getCommandResults}}>
            {children}
        </P2PCommunicationContext.Provider>
    );
}

export { P2PCommunicationStateProvider, useP2PCommunication };