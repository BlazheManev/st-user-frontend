# ST-User Frontend

This is the frontend application for the ST-User project. It is built using React and TypeScript and provides a user interface for managing absences, viewing calendars, and scanning QR codes for attendance tracking.

## Features

- User authentication (login and registration)
- Calendar view for users and administrators
- Absence request form
- QR code generation and scanning
- Push notifications for absence requests

## Live Demo

The application is deployed on Render. You can access it here: [ST-User Frontend](https://st-user-frontend.onrender.com/)

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/st-user-frontend.git
    cd st-user-frontend
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Create a .env file in the root directory and add the following environment variables:
   
   for local
    ```env
    REACT_APP_API_URL=http://localhost:3000
    ```
    for production
     ```env
    REACT_APP_API_URL=https://st-backend-7eb0.onrender.com
    ```

## Running the Application

1. To run the application locally:

    ```bash
    npm start
    ```
    

This will start the development server and open the application in your default web browser.

## Build

1. To create a production build of the application:

    ```bash
    npm run build
    ```

## Service Worker

The application uses a service worker for push notifications and offline capabilities. The service worker is registered in `src/serviceWorkerRegistration.ts`.

## Subscribing to Push Notifications

Push notifications are used to notify admins of new absence requests. The subscription logic is in `src/subscribeToPushNotifications.ts`. It is called after a successful login.

## Code Structure

- **src/components**: Contains the React components.
- **src/services**: Contains the service files for authentication and API calls.
- **src/styles**: Contains the CSS files for styling.
- **src/types**: Contains TypeScript type definitions.

## Deployment

The application is deployed on Render. To deploy your own version:

1. Download this github repository and then push this code to a GitHub repository.
2. Create a new web service on Render and connect it to your GitHub repository.
3. Set the build command to `npm run build` and the start command to `serve -s build`.
