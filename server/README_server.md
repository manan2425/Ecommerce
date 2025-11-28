# Server README (local dev)

To run the backend server locally:

1. (Recommended) Start a local MongoDB instance. For example using MongoDB Community Server or a Docker container.

   Docker (quick):
   ```powershell
   docker run -d -p 27017:27017 --name mongo-local mongo:6
   ```

2. Copy `.env.example` to `.env` and set values if needed. If you leave `MONGODB_URL` blank, the server will default to:

```
mongodb://127.0.0.1:27017/ecommerce1
```

3. Install dependencies and run server in dev mode:

```powershell
npm i
npm run dev
```

4. API endpoints to test:

- POST /api/auth/register — registers a new user, stores in MongoDB `ecommerce1.users`
- POST /api/auth/login — logs in user, issues HTTP-only cookie

If you want to persist data to a remote DB, place its full connection string in `MONGODB_URL` in your `.env`.
