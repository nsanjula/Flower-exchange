# 🌸 Flower Exchange

A full-stack order matching / exchange system for trading flowers. The system follows a **three-tier architecture**:

1. **C++ Matching Engine** — The core backend that performs order validation, matching, and execution report generation.
2. **Node.js API Server** — A REST bridge that converts API requests into CSV, invokes the C++ engine, and returns execution reports as JSON.
3. **React Frontend** — A web UI for submitting orders manually, uploading CSV files, and viewing execution reports.

---

## Architecture

```
┌──────────────┐       HTTP        ┌──────────────────┐     CSV / exec     ┌──────────────────┐
│   React UI   │  ◄──────────────► │  Node.js API     │  ◄──────────────►  │  C++ Engine      │
│  (Vite)      │   JSON requests   │  (Express)       │   exchange.exe     │  (exchange.exe)  │
│  port 5173   │                   │  port 8080       │                    │                  │
└──────────────┘                   └──────────────────┘                    └──────────────────┘
```

**Flow:**

1. The frontend sends orders (JSON or CSV) to the API server.
2. The API server writes orders to `data/orders.csv`.
3. The API server spawns `build/exchange.exe orders.csv`.
4. The C++ engine reads the CSV, validates orders, runs the matching algorithm, and writes results to `output/execution_report.csv`.
5. The API server parses the output CSV and returns JSON execution reports to the frontend.

---

## Project Structure

```
Flower-exchange/
├── src/                          # C++ matching engine source code
│   ├── main.cpp                  # Entry point (CLI or programmatic mode)
│   ├── exchange/                 # Exchange orchestrator
│   │   ├── Exchange.hpp
│   │   └── Exchange.cpp
│   ├── matchingengine/           # Price-time priority matching engine
│   │   ├── MatchingEngine.hpp
│   │   └── MatchingEngine.cpp
│   ├── orderbook/                # Per-instrument order book (buy/sell sides)
│   │   ├── OrderBook.hpp
│   │   └── OrderBook.cpp
│   ├── model/                    # Data models
│   │   ├── Order.hpp
│   │   ├── ExecutionReport.hpp
│   │   └── Trade.hpp
│   ├── validator/                # Pluggable validation rules
│   │   ├── OrderValidator.hpp / .cpp
│   │   ├── ValidationRule.hpp
│   │   ├── InstrumentValidation.hpp
│   │   ├── SideValidation.hpp
│   │   ├── QuantityValidation.hpp
│   │   └── PriceValidation.hpp
│   └── utils/                    # CSV I/O utilities
│       ├── CSVParser.hpp / .cpp
│       └── ExecutionReportWriter.hpp / .cpp
│
├── api-server/                   # Node.js REST API bridge
│   ├── server.js
│   └── package.json
│
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx               # Router (Home, Order, Contact pages)
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Order.jsx
│   │   │   └── Contact.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       ├── OrderTable.jsx
│   │       ├── CSVUpload.jsx
│   │       └── ExecutionReportTable.jsx
│   └── package.json
│
├── data/                         # Input CSV files
│   └── orders.csv
├── output/                       # Generated execution reports
│   └── execution_report.csv
├── build/                        # CMake build output (exchange.exe)
├── CMakeLists.txt                # CMake build configuration
└── README.md
```

---

## Prerequisites

- **C++ compiler** with C++17 support (e.g. MinGW g++, MSVC)
- **CMake** ≥ 3.10
- **Node.js** (includes `npm`)

---

## Build the C++ Engine

```bash
# From the project root
mkdir -p build
cd build
cmake ..
make          # or: cmake --build .
```

This produces `build/exchange.exe`.

### Run the engine standalone (optional)

```bash
# Programmatic mode — pass CSV filename as argument
cd build
./exchange.exe orders.csv

# Interactive mode — prompts for filename
./exchange.exe
```

The engine reads from `data/<filename>` and writes results to `output/execution_report.csv`.

---

## Run the API Server

```bash
cd api-server
npm install
npm run dev
```

The API starts on **`http://localhost:8080`**. It uses `nodemon` for auto-restart during development.

> **Note:** The API server requires `build/exchange.exe` to exist. Build the C++ engine first.

---

## Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite (typically **`http://localhost:5173`**).

---

## API Reference

### `POST /api/orders` — Submit JSON Orders

Accepts a single order object or an array of orders. The server converts them to CSV, runs the C++ engine, and returns the execution reports.

**Order fields:**

| Field           | Type   | Description                                                                 |
|-----------------|--------|-----------------------------------------------------------------------------|
| `clientOrderId` | string | 1–7 alphanumeric uppercase characters                                       |
| `instrument`    | string | One of `Rose`, `Lavender`, `Lotus`, `Tulip`, `Orchid` (case-insensitive)    |
| `side`          | number | `1` = Buy, `2` = Sell                                                       |
| `quantity`      | number | Integer 10–1000, must be a multiple of 10                                   |
| `price`         | number | Must be strictly greater than 0                                             |

**Example:**

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '[{"clientOrderId":"aa13","instrument":"Rose","side":2,"quantity":100,"price":55.0}]'
```

---

### `POST /api/orders/csv` — Upload CSV File

- Content type: `multipart/form-data`
- Form field name: `file`

**Expected CSV columns:**

```csv
Cl.Ord.ID,Instrument,Side,Quantity,Price
aa13,Rose,2,100,55
```

Use the frontend **Upload CSV** tab or Postman / curl:

```bash
curl -X POST http://localhost:8080/api/orders/csv \
  -F "file=@data/orders.csv"
```

---

### `GET /api/reports/latest` — Get Execution Reports

Returns the execution reports generated by the most recent order batch.

**Response fields:**

| Field             | Type   | Description                                      |
|-------------------|--------|--------------------------------------------------|
| `clientOrderId`   | string | Original client order ID                         |
| `orderId`         | string | System-generated order ID (`ord1`, `ord2`, …)    |
| `instrument`      | string | Flower instrument name                           |
| `side`            | number | `1` = Buy, `2` = Sell                            |
| `execStatus`      | string | `New`, `Fill`, `PFill`, or `Rejected`            |
| `quantity`        | number | Executed / remaining quantity                    |
| `price`           | number | Execution price                                  |
| `reason`          | string | Rejection reason (empty if not rejected)         |
| `transactionTime` | string | Timestamp of the transaction                     |

---

### `POST /api/reports/clear` — Clear Cached Reports

Clears the in-memory report cache on the API server.

---

### `GET /api/health` — Health Check

Returns `{ "status": "ok" }` if the server is running.

---

## Execution Report Statuses

| Status     | Meaning                                                                   |
|------------|---------------------------------------------------------------------------|
| `New`      | Order accepted and added to the order book (no immediate match)           |
| `Fill`     | Order fully filled against a resting order                                |
| `PFill`    | Order partially filled — remaining quantity stays on the book             |
| `Rejected` | Order failed validation (invalid instrument, quantity, side, or price)    |

---

## Validation Rules

The C++ engine validates each order using a chain of pluggable rules:

| Rule                    | Condition                                                     |
|-------------------------|---------------------------------------------------------------|
| **Instrument**          | Must be one of: `Rose`, `Lavender`, `Lotus`, `Tulip`, `Orchid`|
| **Side**                | Must be `1` (Buy) or `2` (Sell)                               |
| **Quantity**            | Integer between 10 and 1000, multiple of 10                   |
| **Price**               | Must be greater than 0                                        |

Orders that fail validation are immediately rejected with a reason string in the execution report.

---

## Tech Stack

| Layer    | Technology                                         |
|----------|----------------------------------------------------|
| Engine   | C++17, CMake                                       |
| API      | Node.js, Express, Multer, csv-parse                |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios  |

---

## Sample Data

The `data/` directory includes several test CSV files:

- `orders.csv` — Default small sample (9 orders)
- `100orders.csv` — 100-order stress test
- `1000orders.csv` — 1000-order stress test
- `1.csv` – `8.csv` — Individual test cases