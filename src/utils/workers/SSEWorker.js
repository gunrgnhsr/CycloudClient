onmessage = async (event) => {
    const { currentConnection, onMessage } = event.data
    if (currentConnection.body && currentConnection.body.getReader) {
        const reader = currentConnection.body.getReader();
        let result = '';
        let mesCounter = 0;
        
        while (true) {
            const { done, value } = await reader.read();
            result += new TextDecoder().decode(value);
            let delimiterIndex;
            while ((delimiterIndex = result.indexOf('\n\n')) !== -1) {
                const message = JSON.parse(result.slice(0, delimiterIndex));
                console.log(`Message number ${mesCounter}: `, message);
                mesCounter++;
                if(message.data !== "keep-alive"){
                    onMessage(message);
                }
                result = result.slice(delimiterIndex + 2);
            }

            if (done) {
                postMessage('done');
            }
        } 
    }
};