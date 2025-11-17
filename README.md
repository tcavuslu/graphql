# Zone01 GraphQL Profile

A modern profile page built with Vanilla JS, Tailwind CSS, and Go backend, displaying user data from the Zone01 GraphQL API.

## Quick Start

```bash
npm install
npm run build:css
npm run dev
```

Open: `http://localhost:3000`or visit `https://graphql-silk.vercel.app/`

Login with your Zone01 credentials (username or email + password).

## Features

- 🔐 **JWT Authentication** - Secure login with Zone01 credentials
- 👤 **User Profile** - Three key information sections (Username, Total XP, Audit Ratio)
- 📊 **XP Progress Chart** - Line chart showing cumulative XP over time (excluding piscine exercises)
- 🎯 **Skills Radar Chart** - Spider chart displaying 8 key technical skills
- 📈 **Audit Ratio** - Shows your audit performance (audits given/received)
- 💾 **Total XP** - Displayed in MB format (e.g., 1.27 MB)
- ✨ **Pure SVG Charts** - Custom-built interactive charts without external libraries

## Profile Sections

The profile page consists of:

1. **User Information Section** - Displays username, total XP, and audit ratio in three columns
2. **XP Progress Chart** - Interactive line chart with tooltips
3. **Skills Overview Chart** - Radar/spider chart for technical skills

## GraphQL Queries

All GraphQL queries are centralized in **`js/queries.js`** and used by **`js/api.js`**.

### Query Types Implemented:
- ✅ **Normal queries** - Simple data fetching (e.g., user info)
- ✅ **Nested queries** - Queries with nested objects (e.g., transaction.object)
- ✅ **Queries with arguments** - Using `where`, `order_by`, `_eq`, `_in`, `_like` operators

### API Functions:
- `getUserInfo()` - Get user data (id, login, email from attrs)
- `getXPTransactions()` - Get all XP transactions
- `getTotalXP()` - Calculate total XP (excludes piscine exercises, keeps final piscine rewards)
- `getAuditRatio()` - Calculate audit ratio from up/down transactions
- `getSkillsData()` - Get skills from skill transactions (skill_go, skill_js, skill_algo, etc.)
- `getProgressData()` - Get project completion history

### Example Queries:

**Get User Info (Normal Query):**
```graphql
query {
  user {
    id
    login
    attrs
  }
}
```

**Get XP Transactions (Nested Query with Arguments):**
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

**Get Skill Transactions (Query with _like operator):**
```graphql
query {
  transaction(where: {type: {_like: "skill_%"}}, order_by: {amount: desc}) {
    type
    amount
    createdAt
  }
}
```

**Get Audits (Query with _in operator):**
```graphql
query {
  transaction(where: {type: {_in: ["up", "down"]}}) {
    type
    amount
  }
}
```

**Get Progress History:**
```graphql
query {
  progress(order_by: { createdAt: desc }) {
    id
    grade
    createdAt
    path
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
  config.js         # API endpoints configuration
  queries.js        # GraphQL query definitions
  router.js         # Hash routing (#login, #profile)
  auth.js           # JWT login/logout
  login.js          # Login form handling
  api.js            # API functions (uses queries.js)
  profile.js        # Profile logic
  charts.js         # SVG charts (line chart + radar chart)
server/
  main.go           # Go proxy (port 8080)
  handlers/proxy.go # Auth & GraphQL forwarding
  middleware/cors.go # CORS handling
```

## Charts

Both charts are built from scratch using pure SVG (no external charting libraries).

### 1. XP Progress Over Time (Line Chart)
- Shows cumulative XP growth from all non-piscine exercises
- Grouped by month with cumulative totals
- X-axis: Time (monthly intervals)
- Y-axis: XP amount in kilobytes (k)
- Interactive hover tooltips showing exact values
- Gradient fill and smooth line with animated transitions

### 2. Skills Radar Chart (Spider Chart)
Displays **8 key technical skills** from `skill_*` transactions:
- Frontend
- Programming
- Backend
- Go
- JavaScript
- Git
- Docker
- Algorithm

Values represent the maximum cumulative skill level from transactions (0-100 scale).
Interactive hover effects on both points and labels.

## Authentication Flow

1. User enters username/email and password
2. Credentials are Base64 encoded and sent to `/api/auth/signin`
3. JWT token is received and stored in localStorage
4. Token is used for all subsequent GraphQL requests
5. On logout, token is cleared and user returns to login page

## Error Handling

- Invalid credentials show appropriate error message
- Expired tokens automatically redirect to login
- GraphQL errors are caught and displayed
- Network errors are handled gracefully

## NPM Scripts

- `npm run dev` - Start everything (CSS watch + backend + frontend)
- `npm run build:css` - Build Tailwind CSS once
- `npm run watch:css` - Watch CSS changes
- `npm run start:frontend` - Frontend server (port 3000)
- `npm run start:backend` - Go backend (port 8080)
- `npm run build` - Production build (builds CSS)

## Environment Configuration

The app automatically detects the environment:
- **Development**: Uses `http://localhost:8080` (when hostname is localhost)
- **Production**: Uses `https://graphql-esp2.onrender.com` (when deployed)

See `js/config.js` for configuration details.

## Troubleshooting

### 404 Errors
1. Make sure you ran `npm install`
2. Build CSS: `npm run build:css`
3. Check `css/output.css` exists and has content
4. Use full URL: `http://localhost:3000` (not just `localhost:3000`)
5. Backend must be running on port 8080

### Login Issues
1. Verify backend is running (`npm run start:backend`)
2. Check browser console for authentication errors
3. Ensure credentials are correct (username or email + password)

### Charts Not Displaying
1. Check browser console for JavaScript errors
2. Verify GraphQL queries are returning data
3. Ensure JWT token is valid (check localStorage)

## Technologies Used

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Tailwind CSS
- **Backend**: Go (Golang) with net/http
- **API**: GraphQL
- **Charts**: Pure SVG (custom implementation)
- **Authentication**: JWT (JSON Web Tokens)
- **Routing**: Hash-based client-side routing
