# Bajaj Finserv Health Dev Challenge — Qualifier Round

**Name:** Naman Kumar  
**Email:** naman1910.be23@chitkara.com

---

## Deployed API URLs

| Method | Endpoint | URL |
|--------|----------|-----|
| POST | `/bfhl` | https://paper-mu-three.vercel.app/bfhl |
| GET | `/health` | https://paper-mu-three.vercel.app/health |

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Provider:** Google Gemini (gemini-2.0-flash)
- **Deployment:** Vercel (Serverless)

---

## How to Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/naman-kumar1212/Paper.git
   cd Paper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   OFFICIAL_EMAIL=your_email@chitkara.com
   ```

4. Start the server:
   ```bash
   npm start
   ```
   Server runs at `http://localhost:3000`

---

## API Reference

### POST /bfhl

Accepts exactly **one** key per request:

| Key | Input | Output |
|-----|-------|--------|
| `fibonacci` | Integer | Fibonacci series of that length |
| `prime` | Integer array | Only the prime numbers |
| `lcm` | Integer array | LCM of all values |
| `hcf` | Integer array | HCF/GCD of all values |
| `AI` | String (question) | Single-word AI answer |

**Example:**
```json
POST /bfhl
{ "fibonacci": 7 }

Response:
{ "is_success": true, "official_email": "...", "data": [0,1,1,2,3,5,8] }
```

### GET /health

```json
{ "is_success": true, "official_email": "..." }
```

---

## Project Structure

```
├── api/
│   └── index.js        # All API logic (Express app)
├── .env                # API keys (gitignored)
├── .gitignore
├── package.json
└── README.md
```