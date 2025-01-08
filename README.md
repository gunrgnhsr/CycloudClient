# ReCycloud

ReCycloud is a web application that enables clients to rent and loan computing resources online, creating a collaborative ecosystem for efficient resource utilization.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Components](#components)
- [Providers](#providers)
- [Utilities](#utilities)
- [Workers](#workers)
- [Scripts](#scripts)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/recycloud.git
    cd recycloud
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm start
    ```

## Usage

- Open your browser and navigate to `http://localhost:3000` to access the application.
- Use the login form to authenticate and start using the platform.

## Project Structure

## Components

- **App.js**: The main application component.
- **Header.js**: The header component with navigation and logout functionality.
- **Footer.js**: The footer component.
- **LandingPage.js**: The landing page component.
- **Client.js**: The main client component with tabs for resources, requests, and tasks.

## Providers

- **CommunicationStateProvider.js**: Provides communication state and functions for HTTP and WebSocket requests.
- **LoginStateProvider.js**: Provides login state and authentication functions.
- **NotificationProvider.js**: Provides notification state and functions.

## Utilities

- **utils.js**: Utility functions for various tasks.
- **workers/**: Web worker scripts for handling complex tasks and WebAssembly.

## Workers

- **webWorker.js**: Handles running functions in a web worker.
- **wasmWorker.js**: Handles running WebAssembly tasks in a web worker.
- **complexTaskWorker.js**: Handles running complex tasks with multiple WebAssembly modules in a web worker.
- **SSEWorker.js**: Handles Server-Sent Events (SSE) in a web worker.

## License

This project is licensed under the MIT License.
