require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Helper functions for logic
function getFibonacci(n) {
  if (typeof n !== "number" || n <= 0) throw new Error("Input must be a positive integer");
  let series = [0, 1];
  if (n === 1) return [0];
  while (series.length < n) {
    series.push(series[series.length - 1] + series[series.length - 2]);
  }
  return series;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function getPrimes(arr) {
  if (!Array.isArray(arr)) throw new Error("Input must be an array");
  return arr.filter(num => Number.isInteger(num) && isPrime(num));
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function getHCF(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("Input must be a non-empty array");
  return arr.reduce((a, b) => gcd(a, b));
}

function getLCM(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("Input must be a non-empty array");
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

async function getAIAnswer(question) {
  if (!OPENROUTER_API_KEY) throw new Error("API Key missing");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: "Answer in one word: " + question }]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "AI Error");
  return data.choices[0].message.content.trim().split(" ")[0]; // Get first word
}

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

// Main POST Endpoint
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    // Strict check: exactly one key allowed
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        message: "Request must contain exactly one key"
      });
    }

    const key = keys[0];
    const value = body[key];
    let data;

    if (key === "fibonacci") {
      data = getFibonacci(value);
    } else if (key === "prime") {
      data = getPrimes(value);
    } else if (key === "lcm") {
      data = getLCM(value);
    } else if (key === "hcf") {
      data = getHCF(value);
    } else if (key === "AI") {
      data = await getAIAnswer(value);
    } else {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        message: "Invalid Key"
      });
    }

    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: data
    });

  } catch (error) {
    res.status(400).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      message: error.message
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;