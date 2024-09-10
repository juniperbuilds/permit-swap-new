# permit-swap

A web application that allows users to list, browse, and swap outdoor permits for activities like hiking, camping, and backpacking. Users can coordinate the transfer or cancellation of permits for locations across the U.S.

## Features
- Post, browse, and search for permit swap requests.
- Secure messaging system between users for coordination.
- Links to official permit transfer websites when applicable.
- User profiles and swap history.
  
## Tech Stack
- **Frontend**: React.js, Axios, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (NoSQL) or PostgreSQL (SQL)
- **Real-time Messaging**: WebSockets with Socket.io

## Setup Instructions

Follow these steps to get the project up and running:

```bash
# Clone the repository
git clone https://github.com/your-repo/permit-swap-website.git

# Navigate to the project directory
cd permit-swap-website

# Install backend dependencies
npm install

# Start the backend server
node index.js

# Navigate to the frontend folder
cd frontend

# Install frontend dependencies
npm install

# Start the frontend server
npm start
