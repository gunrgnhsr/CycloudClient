onmessage = (event) => {
    const { type, fn, data } = event.data
    if (type === 'runFunction') {
        const result = fn(data);
        postMessage(result);
    }
};