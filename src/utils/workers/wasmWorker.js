onmessage = async (event) => {
    const { wasmBuffer, functionName, args, numberOfOutputs } = event.data.data;

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
    let outputStart = wasm.instance.exports.output_start;
    const results = [];
    for (let i = 0; i < numberOfOutputs; i++) {
        let outputEnd = outputStart;
        while (memory[outputEnd] !== 0) {
            outputEnd++;
        }
        const result = decoder.decode(memory.subarray(outputStart, outputEnd));
        results.push(result);
        outputStart = outputEnd + 1; // Move to the next output
    }

    // Post the result back to the main thread
    postMessage(results);
};