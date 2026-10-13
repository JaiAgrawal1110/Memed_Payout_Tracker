# Meme'd Campaign Payout Tracker

Creator marketplace app: brands create campaigns with a budget and milestone ladder; creators submit posts and earn the highest milestone their post has crossed, never exceeding the campaign budget.

**Live links:** _TODO_ (frontend) / _TODO_ (backend)

## Tech Stack
- Backend: Node.js, TypeScript, Express, MongoDB (Mongoose), JWT, Zod, Jest
- Frontend: Next.js, TypeScript
- Deployment: MongoDB Atlas, Render, Vercel

## Setup
```bash
# Backend
cd backend
cp .env.example .env   # fill in values
npm install
npm run dev
npm test

# Frontend (after Phase 6)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Environment Variables
| Variable | Where | Description |
|---|---|---|
| PORT | backend | Server port (default 4000) |
| MONGO_URI | backend | MongoDB Atlas connection string |
| JWT_SECRET | backend | Secret used to sign JWTs |
| JWT_EXPIRES_IN | backend | Token lifetime, e.g. 7d |
| CORS_ORIGIN | backend | Allowed frontend origin |
| NEXT_PUBLIC_API_URL | frontend | Base URL of the backend API |

## Assumptions (open cases)
| Open question | Decision |
|---|---|
| Post crosses 2 milestones in one update | Pay the highest milestone's amount in total (no stacking); pay only the difference from what was already paid |
| Views go down | Never claw back; payout is monotonic |
| Same update sent twice | No double pay; track `amountPaid` per submission and pay `milestoneAmount - amountPaid` |
| Budget runs out mid-payout | Pay the partial remaining amount; campaign is then exhausted |
| Campaign has 0 budget left | Hidden from the live campaigns list |
| Ladder validation | Thresholds unique and ascending, payouts increasing, all positive |

## API Reference
_TODO: fill in as endpoints are built._

## Scaling
See [docs/SCALING.md](docs/SCALING.md).
