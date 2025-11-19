# Backend (Express + MongoDB)

## Setup
1. Copy `.env.example` to `.env` and fill values:
```
MONGODB_URI=...
JWT_SECRET=...
PORT=5000
```

2. Install dependencies
```
npm install
```

3. Start dev server
```
npm run dev
```

## Endpoints
- `GET /api/health` — health check
- `POST /api/auth/register` — { username, email, password }
- `POST /api/auth/login` — { email, password }
- `POST /api/users/:id/follow` — Bearer token
- `POST /api/users/:id/unfollow` — Bearer token
- `GET /api/users/:id` — public profile
- `POST /api/lists/` — { name, description }
- `GET /api/lists/me`
- `POST /api/lists/:id/items` — { malId, title, score, status }
- `DELETE /api/lists/:id/items/:malId`
- `POST /api/reviews` — { malId, rating, text } (auto sentiment)
- `GET /api/reviews/anime/:malId`
- `GET /api/recommendations/me`
