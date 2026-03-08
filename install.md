# MigrateHub Installation Guide

Follow these steps to deploy MigrateHub on your production server.

## Prerequisites
- Node.js (v18+)
- SQLite3 (for local database)
- PostgreSQL (optional, if migrating from SQLite)
- Nginx (for reverse proxy)
- PM2 (for process management)

## 1. Environment Configuration
Create a `.env` file in the root directory based on the provided template.

```bash
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=./server/migratehub_database.db
```

## 2. Server Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/migratehub.git
cd migratehub

# Install dependencies for both frontend and backend
npm install
cd server && npm install
cd ..
```

## 3. Database Setup (SQLite)
The application is configured to use SQLite by default for easy deployment.
The database file `migratehub_database.db` will be automatically created in the `/server` directory upon the first start.

### Editing SQL Details
If you need to change the database path or switch to PostgreSQL:
1. Open `server/db.js`
2. Modify the initialization logic to point to your new database.
3. Update `DATABASE_URL` in your `.env` file.

## 4. Production Build
```bash
# Build the React frontend
npm run build
```

## 5. Starting the Backend
Use PM2 to ensure the server stays online.
```bash
cd server
pm2 start index.js --name "migratehub-api"
```

## 6. Nginx Configuration
Configure Nginx to serve the `dist/` folder and proxy API requests.

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/migratehub/dist;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Offline Superadmin Login
For emergency access or offline environments, the following credentials are hard-coded in the system:
- **Username:** admin
- **Password:** admin123
