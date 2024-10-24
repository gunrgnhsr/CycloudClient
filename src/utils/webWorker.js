onmessage = (event) => {
    if (event.data.type === 'runFunction') {
        const { fn, data } = event.data;
        const result = fn(data);
        postMessage(result);
    }
};