onmessage = async (event) => {
    const { tasks , args } = event.data;
    for (let i = 0; i < tasks.length; i++) {
        const { wasmBuffer, functionName, outputs } = tasks[i];
        let results;

        // Instantiate the Wasm module from the buffer
        const wasm = await WebAssembly.instantiate(wasmBuffer);

        const memory = new Uint8Array(wasm.instance.exports.memory.buffer);
        let position = wasm.instance.exports.input_start;
        const functionArgs = [];
        const encoder = new TextEncoder();

        if (i > 0) args = results;

        for (let j = 0; j < args.length; j++) {
            let argLength = args[j].length;
            const encodedArg = encoder.encode(args[j]);
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
        results = new Array(outputs.length).fill(null)
        for (let j = 0; j < numberOfOutputs; j++) {
            let outputEnd = outputStart;
            while (memory[outputEnd] !== 0) {
                outputEnd++;
            }
            const result = decoder.decode(memory.subarray(outputStart, outputEnd));
            results[outputs[i].arg_num] = result;
            outputStart = outputEnd + 1; // Move to the next output
        }

        // Post the result back to the main thread
        if(i===tasks.length-1) postMessage(results);
    }
};