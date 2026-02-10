require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());

// limit payload size to prevent abuse (1mb should be plenty)
app.use(express.json({ limit: "1mb" }));

// handle malformed JSON gracefully — without this, express throws an ugly HTML error
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      is_success: false,
      official_email: process.env.OFFICIAL_EMAIL,
      message: "Invalid JSON in request body",
    });
  }
  next(err);
});

const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// allowed keys for the POST /bfhl endpoint
const allowedKeys = ["fibonacci", "prime", "lcm", "hcf", "AI"];

// reasonable limits to prevent server from hanging on huge inputs
const MAX_FIBONACCI_N = 1000;
const MAX_ARRAY_LENGTH = 10000;


// generates fibonacci series of length n -> [0, 1, 1, 2, 3, 5, ...]
function getFibonacci(n) {
  if (typeof n !== "number" || !Number.isInteger(n) || n <= 0) {
    throw new Error("fibonacci value must be a positive integer");
  }
  if (n > MAX_FIBONACCI_N) {
    throw new Error("fibonacci value is too large, max allowed is " + MAX_FIBONACCI_N);
  }

  let series = [];
  for (let i = 0; i < n; i++) {
    if (i === 0) series.push(0);
    else if (i === 1) series.push(1);
    else series.push(series[i - 1] + series[i - 2]);
  }
  return series;
}

// checks if a single number is prime
function isPrime(num) {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;

  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

// filters out only prime numbers from the given array
function getPrimes(arr) {
  if (!Array.isArray(arr)) {
    throw new Error("prime value must be an array of integers");
  }
  if (arr.length > MAX_ARRAY_LENGTH) {
    throw new Error("array too large, max " + MAX_ARRAY_LENGTH + " elements allowed");
  }
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "number" || !Number.isInteger(arr[i])) {
      throw new Error("every element in the prime array must be an integer");
    }
  }
  return arr.filter(isPrime);
}

// basic gcd using euclidean algorithm
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// lcm of two numbers = (a * b) / gcd(a, b)
function lcmOfTwo(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

// computes LCM of an entire array by reducing pairwise
function getLCM(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("lcm value must be a non-empty array of integers");
  }
  if (arr.length > MAX_ARRAY_LENGTH) {
    throw new Error("array too large, max " + MAX_ARRAY_LENGTH + " elements allowed");
  }
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "number" || !Number.isInteger(arr[i]) || arr[i] <= 0) {
      throw new Error("lcm array must contain only positive integers");
    }
  }
  return arr.reduce((acc, val) => lcmOfTwo(acc, val));
}

// computes HCF (GCD) of an entire array by reducing pairwise
function getHCF(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("hcf value must be a non-empty array of integers");
  }
  if (arr.length > MAX_ARRAY_LENGTH) {
    throw new Error("array too large, max " + MAX_ARRAY_LENGTH + " elements allowed");
  }
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== "number" || !Number.isInteger(arr[i]) || arr[i] <= 0) {
      throw new Error("hcf array must contain only positive integers");
    }
  }
  return arr.reduce((acc, val) => gcd(acc, val));
}

// sends the question to Gemini and extracts a single-word answer
async function getAIAnswer(question) {
  if (typeof question !== "string" || question.trim() === "") {
    throw new Error("AI value must be a non-empty string");
  }
  if (question.length > 5000) {
    throw new Error("question is too long");
  }
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // prompt engineered to force a single-word response
  const prompt =
    "Answer the following question in exactly ONE word. " +
    "No punctuation, no explanation, just the word.\n\n" +
    "Question: " + question;

  const result = await model.generateContent(prompt);
  let answer = result.response.text().trim();

  // safety: if model still returns multiple words, just grab the first one
  answer = answer.split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, "");
  return answer || "unknown";
}


/*  ==========
    API Routes
    ========== */

// GET /health — simple health-check / identity verification
app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL,
  });
});

// POST /bfhl — main logic endpoint
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    // body should be a proper JSON object (not null, not an array)
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        message: "Request body must be a valid JSON object",
      });
    }

    const keys = Object.keys(body);

    // must send exactly one key
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        message: "Request body must contain exactly one key",
      });
    }

    const key = keys[0];
    const value = body[key];

    // block prototype pollution attempts (__proto__, constructor, etc.)
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        message: "Invalid key",
      });
    }

    // the key must be one of the 5 allowed ones
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        message: "Invalid key '" + key + "'. Allowed: fibonacci, prime, lcm, hcf, AI",
      });
    }

    // run the right function based on the key
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
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: data,
    });

  } catch (err) {
    // any validation or runtime error ends up here
    return res.status(400).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      message: err.message,
    });
  }
});

// 404 for anything else
app.use((req, res) => {
  return res.status(404).json({
    is_success: false,
    official_email: OFFICIAL_EMAIL,
    message: "Route not found",
  });
});


// start server locally (vercel handles this in production)
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
  });
}

module.exports = app;
