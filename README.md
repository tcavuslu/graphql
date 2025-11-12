# Zone01 GraphQL Profile

## Quick Start

```bash
npm install
npm run build:css
npm run dev
```

Open: `http://localhost:3000`

## Manual Start

Terminal 1:
```bash
cd server
go run .
```

Terminal 2:
```bash
npm run start:frontend
```

## GraphQL Queries

All queries are in **`js/api.js`** (based on Zone01 actual schema):

### Working Queries:
- `getUserInfo()` - Get user data (id, login, attrs)
- `getXPTransactions()` - Get XP history (type: "xp")
- `getAuditRatio()` - Get audit stats (type: "up"/"down")
- `getSkillsData()` - Derive skills from completed progress
- `getProgressData()` - Get project completion history

### Example Queries:

**Get XP:**
```javascript
query {
  transaction(where: {type: {_eq: "xp"}}) {
    amount
    createdAt
    path
    object { name, type }
  }
}
```

**Get Audits:**
```javascript
query {
  transaction(where: {type: {_in: ["up", "down"]}}) {
    type
    amount
  }
}
```

**Get Progress:**
```javascript
query {
  progress(where: {isDone: {_eq: true}}) {
    path
    grade
    object { name, type }
  }
}
```

## Project Structure

```
index.html          # Single page (login + profile views)
input.css           # Tailwind source
css/output.css      # Built CSS (run build:css first)
js/
  queries.js        # GraphQL query definitions ← NEW
  router.js         # Hash routing (#login, #profile)
  auth.js           # JWT login/logout
  api.js            # API functions (uses queries.js)
  profile.js        # Profile logic
  charts.js         # SVG charts (line chart + spider chart)
server/
  main.go           # Go proxy (port 8080)
  handlers/proxy.go # Auth & GraphQL forwarding
  middleware/cors.go # CORS handling
```

## Charts

1. **XP Timeline** - Line chart showing cumulative XP growth over time
   - Shows every 3 months on X-axis (Oct 24, Jan 25, etc.)
   - Hover points for exact values

2. **Skills Spider** - Radar chart with 7 skills:
   - Frontend
   - Programming
   - Backend
   - Go
   - JavaScript
   - Git
   - Docker

## NPM Scripts

- `npm run dev` - Start everything (CSS watch + backend + frontend)
- `npm run build:css` - Build Tailwind CSS once
- `npm run watch:css` - Watch CSS changes
- `npm run start:frontend` - Frontend server (port 3000)
- `npm run start:backend` - Go backend (port 8080)

## Troubleshooting 404

1. Make sure you ran `npm install`
2. Build CSS: `npm run build:css`
3. Check `css/output.css` exists and has content
4. Use full URL: `http://localhost:3000` (not just `localhost:3000`)
5. Backend must be running on port 8080
