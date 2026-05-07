# Salahny Web App

Responsive web version of the Salahny mobile app. It uses the existing Salahny Node.js + Express + MongoDB Atlas backend and keeps the same role-based product experience for drivers, workshops, and super admins.

## Run with your existing Salahny backend

1. Start your existing backend first:

```powershell
# from your backend project
npm.cmd run dev
```

It must be available at:

```text
http://localhost:5000/api
```

2. Start the web app:

```powershell
cd C:\Users\Hotline\salahny_project\salahny-web
npm.cmd install
cd frontend
npm.cmd install
npm.cmd run dev
```

Open:

- Frontend dev app: http://localhost:5173
- Existing backend API expected by the web app: http://localhost:5000/api

The frontend stores the returned `accessToken` in `localStorage` and sends it as:

```text
Authorization: Bearer TOKEN
```

If your backend uses a different URL, create `frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

The config file is:

```text
frontend/src/config/api.js
```

## Build the web app

```powershell
cd C:\Users\Hotline\salahny_project\salahny-web\frontend
npm.cmd run build
```

## Demo accounts

Use the accounts from your MongoDB Atlas backend. The web login calls:

- `POST /api/auth/login`
- `POST /api/auth/register`

Role redirect:

- `driver` -> `/driver`
- `workshop` -> `/workshop`
- `admin` -> `/admin`

## Database

The web app does not create a second database. It connects to your existing Node.js + Express + MongoDB Atlas backend at `http://localhost:5000/api`.

Mock fallback data is included only to keep the interface usable if the backend is temporarily offline. Real API data is always preferred.

## Troubleshooting

Blank page:

- Stop old Vite servers, then run `npm.cmd run dev` again inside `frontend`.
- Open `http://localhost:5173`.
- Hard refresh Chrome with `Ctrl + F5`.

CORS errors:

- In your backend, allow `http://localhost:5173`.
- Example Express CORS origin: `http://localhost:5173`.

JWT errors:

- Confirm login response contains `accessToken` and `user`.
- Confirm protected requests include `Authorization: Bearer TOKEN`.

Backend connection errors:

- Open `http://localhost:5000/api/services` or another public endpoint to confirm the backend is running.
- If your backend uses another port, set `VITE_API_BASE_URL` in `frontend/.env`.
