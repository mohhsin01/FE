# Sales Insights Dashboard (Frontend)

This Repo contains the Vue 3 interface for the Sales Insights Dashboard. It talks to a REST API at `http://localhost:8080/api`.

## Requirements

- Node.js 18 or newer (LTS is fine) – download from [nodejs.org](https://nodejs.org)
- npm 9 or newer (bundled with Node.js)

## Run the frontend

### 1. Clone the repo
```bash
git clone <repo-url>
```

### 2. Enter the frontend folder
```bash
cd FE
```

### 3. Install dependencies
```bash
npm install
```

### 4. Install axios (already listed in package.json, but run again if needed)
```bash
npm install axios
```

### 5. Start the dev server
```bash
npm run dev
```

The app loads at `http://localhost:5173`. Make sure the backend is running on `http://localhost:8080` so the dashboard can fetch data.
