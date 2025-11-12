# Zone01 GraphQL Profile

A modern profile page built with Vanilla JS, Tailwind CSS, and Go backend, displaying user data from the Zone01 GraphQL API.

## Quick Start

```bash
npm install
npm run build:css
npm run dev
```

Open: `http://localhost:3000`

Login with your Zone01 credentials (username or email + password).

```

## Features

- 🔐 **JWT Authentication** - Secure login with Zone01 credentials
- 📊 **XP Progress Chart** - Line chart showing cumulative XP over time (excluding piscine exercises)
- 🎯 **Skills Radar Chart** - Spider chart displaying 7 key skills from skill transactions
- 📈 **Audit Ratio** - Shows your audit performance (given/received)
- 💾 **Total XP** - Displayed in MB format (e.g., 1.27 MB)

## GraphQL Queries

All GraphQL queries are centralized in **`js/queries.js`** and used by **`js/api.js`**.

### API Functions:
- `getUserInfo()` - Get user data (id, login, email from attrs)
- `getXPTransactions()` - Get all XP transactions
- `getTotalXP()` - Calculate total XP (excludes piscine exercises, keeps final piscine rewards)
- `getAuditRatio()` - Calculate audit ratio from up/down transactions
- `getSkillsData()` - Get skills from skill transactions (skill_go, skill_js, skill_algo, etc.)
- `getProgressData()` - Get project completion history

### Example Queries:

**Get User Info:**
```graphql
query {
  user {
    id
    login
    attrs
  }
}
```

**Get XP Transactions:**
```graphql
query {
  transaction(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
    id
    amount
    createdAt
    path
    object {
      name
      type
    }
  }
}
```

**Get Skill Transactions:**
```graphql
query {
  transaction(where: {type: {_like: "skill_%"}}, order_by: {amount: desc}) {
    type
    amount
    createdAt
  }
}
```

**Get Audits:**
```graphql
query {
  transaction(where: {type: {_in: ["up", "down"]}}) {
    type
    amount
  }
}
```

**Get Completed Progress:**
```graphql
query {
  progress(where: {isDone: {_eq: true}}) {
    path
    grade
    object {
      name
      type
    }
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

### 1. XP Progress Over Time (Line Chart)
- Shows cumulative XP growth from all non-piscine exercises
- X-axis: Time 
- Y-axis: XP amount
- Interactive hover tooltips for exact values
- Gradient fill and smooth line

### 2. Skills Radar Chart (Spider Chart)
Displays 7 key technical skills from `skill_*` transactions:


Values represent the maximum cumulative skill level from transactions.

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
