# PlotPilot Installation Instructions

## Requirements
- Node.js (v18 or newer recommended)
- npm (usually comes with Node.js)

## Setup Steps

1. **Open a terminal** in this folder.

2. **Install Dependencies**:
   Run the following command to download all necessary libraries:
   ```bash
   npm install
   ```
   *Note for Windows PowerShell users: If you see a security error, try `npm.cmd install` instead.*

3. **Run the Application**:
   Start the development server:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## Troubleshooting
- If you see `EADDRINUSE`, it means the port 3000 is taken. The app may automatically switch to 3001, or you might need to close the conflicting process.
- If you see `UnauthorizedAccess` errors on Windows, ensure you use `npm.cmd` as noted above.
