onmessage = async (event) => {
    const { wasmBuffer, functionName, args } = event.data.data;

    // Instantiate the Wasm module from the buffer
    const wasm = await WebAssembly.instantiate(wasmBuffer);

    const memory = new Uint8Array(wasm.instance.exports.memory.buffer);
    let position = wasm.instance.exports.input_start;
    const functionArgs = [];
    const encoder = new TextEncoder();

    for (let i = 0; i < args.length; i++) {
        let argLength = args[i].length;
        const encodedArg = encoder.encode(args[i]);
        memory.set(encodedArg, position);
        functionArgs.push(position);
        functionArgs.push(argLength);
        position += argLength;
    }

    // Execute the specified function
    wasm.instance.exports[functionName](...functionArgs);
    
    // Read the result from memory using TextDecoder
    const decoder = new TextDecoder();
    const outputStart = wasm.instance.exports.output_start;
    let outputEnd = outputStart;
    while (memory[outputEnd] !== 0) {
        outputEnd++;
    }
    const result = decoder.decode(memory.subarray(outputStart, outputEnd));

    // Post the result back to the main thread
    postMessage(result);
};