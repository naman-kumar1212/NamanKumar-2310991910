# Product Requirements Document (PRD)

**Project:** Bajaj Finserv Qualifier REST APIs
**Date:** 10 Feb 2026
**Owner:** Candidate
**Audience:** Evaluators / Automated Test System

---

## 1. Objective

Develop, host, and publicly expose **two REST APIs** that strictly conform to the specifications defined in the qualifier paper.

Failure to follow response structure, validation rules, or deployment requirements results in automatic rejection.

---

## 2. Scope

### In Scope

* Exactly **two REST APIs**
* Public deployment
* External AI integration
* Strict response schema enforcement
* Robust error handling

### Out of Scope

* Databases or persistence
* Authentication for inbound requests
* UI or frontend
* Additional endpoints
* Additional response fields

---

## 3. Technology Constraints

### Allowed Tech Stack

* Node.js **or**
* Python **or**
* Java

Any framework is allowed.

No other runtime languages are permitted.

---

## 4. API Inventory

### API 1: Core Logic API

* **Method:** POST
* **Endpoint:** `/bfhl`
* **Accessibility:** Public

### API 2: Health API

* **Method:** GET
* **Endpoint:** `/health`
* **Accessibility:** Public

---

## 5. API 1: POST /bfhl

### 5.1 Request Rules

* Request body **must contain exactly one key**
* Accepted keys:

  * `fibonacci`
  * `prime`
  * `lcm`
  * `hcf`
  * `AI`
* Any request violating this rule must fail

---

### 5.2 Functional Mapping

| Key       | Input Type        | Output             |
| --------- | ----------------- | ------------------ |
| fibonacci | Integer           | Fibonacci series   |
| prime     | Integer array     | Prime numbers only |
| lcm       | Integer array     | LCM value          |
| hcf       | Integer array     | HCF value          |
| AI        | String (question) | Single-word answer |

---

### 5.3 Mandatory Success Response Structure

All successful responses **must** match this structure exactly:

```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL",
  "data": "..."
}
```

* Field names are case-sensitive
* `official_email` must always be present
* `data` type varies by request

---

### 5.4 Error Handling Requirements

* Errors must return:

  * Correct HTTP status code
  * `is_success = false`
* No crashes under any input
* Hidden test cases will validate:

  * Boundary conditions
  * Invalid types
  * Security edge cases

---

### 5.5 Example Requests and Expected Outputs

#### Fibonacci

**Request**

```json
{ "fibonacci": 7 }
```

**Response**

```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL",
  "data": [0,1,1,2,3,5,8]
}
```

#### Prime

**Request**

```json
{ "prime": [2,4,7,9,11] }
```

**Response**

```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL",
  "data": [2,7,11]
}
```

#### LCM

**Request**

```json
{ "lcm": [12,18,24] }
```

**Response**

```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL",
  "data": 72
}
```

#### HCF

**Request**

```json
{ "hcf": [24,36,60] }
```

**Response**

```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL",
  "data": 12
}
```

#### AI

**Request**

```json
{ "AI": "What is the capital city of Maharashtra?" }
```

**Response**

```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL",
  "data": "Mumbai"
}
```

---

## 6. API 2: GET /health

### 6.1 Purpose

* Health check
* Identity verification

### 6.2 Response Structure

```json
{
  "is_success": true,
  "official_email": "YOUR CHITKARA EMAIL"
}
```

No request body.
No additional fields allowed.

---

## 7. AI Integration Requirements

### Supported Providers

* Google Gemini
* OpenAI
* Anthropic

### Mandatory Conditions

* External API must be used
* AI output must be **single-word**
* API key must be generated and used securely

### Gemini API Key Acquisition

1. Visit [https://aistudio.google.com](https://aistudio.google.com)
2. Sign in
3. Get API Key
4. Create key in project
5. Copy and store securely

---

## 8. Deployment Requirements

### Allowed Platforms

* Vercel
* Railway
* Render

### Constraints

* APIs must be publicly accessible
* Localhost-only deployments are invalid
* ngrok allowed only for temporary testing

---

## 9. GitHub Requirements

### Repository

* Must be public
* Must contain:

  * Full source code
  * Configuration files
  * Deployment readiness

### Submission

* GitHub repository URL
* Deployed API URLs

---

## 10. Evaluation Criteria

The following are independently graded:

* Strict API response structure
* Correct HTTP status codes
* Robust input validation
* Graceful error handling
* Security guardrails
* Public accessibility

Hidden tests will validate:

* Error codes
* Boundary conditions
* Structure consistency
* Security edge cases

---

## 11. Acceptance Criteria

This PRD is satisfied **only if**:

* Exactly two endpoints exist
* All examples pass verbatim
* No additional fields appear
* External AI is demonstrably used
* APIs are publicly reachable
* Repository is public

Any deviation is a failure.