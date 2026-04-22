const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { spawn } = require('child_process');

const app = express();
const PORT = 8080;

// ─── Paths (relative to project root, one level above api-server/) ───────────
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR     = path.join(PROJECT_ROOT, 'data');
const OUTPUT_DIR   = path.join(PROJECT_ROOT, 'output');
const BUILD_DIR    = path.join(PROJECT_ROOT, 'build');
const ORDERS_CSV   = path.join(DATA_DIR, 'orders.csv');
const REPORT_CSV   = path.join(OUTPUT_DIR, 'execution_report.csv');
const EXCHANGE_EXE = path.join(BUILD_DIR, 'exchange.exe');

app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

let latestBatchReports = [];


function ordersToCSV(orders) {
  const header = 'Cl.Ord.ID,Instrument,Side,Quantity,Price';
  const rows = orders.map(o => {
    const instrument = String(o.instrument || '').trim();
    const normInstrument = instrument.charAt(0).toUpperCase() + instrument.slice(1).toLowerCase();
    return [
      String(o.clientOrderId || '').trim(),
      normInstrument,
      Number(o.side),
      Number(o.quantity),
      Number(o.price)
    ].join(',');
  });
  return header + '\n' + rows.join('\n') + '\n';
}

function runExchange(csvFilename) {
  return new Promise((resolve, reject) => {
    const proc = spawn(EXCHANGE_EXE, [csvFilename], {
      cwd: BUILD_DIR
    });

    let stderr = '';
    proc.stderr.on('data', chunk => { stderr += chunk.toString(); });

    proc.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`exchange.exe exited with code ${code}. stderr: ${stderr}`));
      }
    });

    proc.on('error', err => {
      reject(new Error(`Failed to start exchange.exe: ${err.message}`));
    });
  });
}

function parseExecutionReport() {
  if (!fs.existsSync(REPORT_CSV)) {
    throw new Error(`Execution report not found at: ${REPORT_CSV}`);
  }

  const raw = fs.readFileSync(REPORT_CSV, 'utf-8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return records.map(r => ({
    clientOrderId:   r['ClientOrderId'] || '',
    orderId:         r['OrderId']        || '',
    instrument:      r['Instrument']     || '',
    side:            Number(r['Side'])   || 0,
    execStatus:      r['Status']         || '',
    quantity:        Number(r['Quantity']) || 0,
    price:           Number(r['Price'])  || 0,
    reason:          r['Reason']         || '',
    transactionTime: r['TransactionTime'] || ''
  }));
}


async function processCsvThroughExchange(csvContent) {
  // Ensure data/ and output/ directories exist
  fs.mkdirSync(DATA_DIR,   { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  fs.writeFileSync(ORDERS_CSV, csvContent, 'utf-8');

  await runExchange('orders.csv');

  const reports = parseExecutionReport();

  latestBatchReports = reports;

  return reports;
}


// POST /api/orders — Accept JSON orders, convert to CSV, run exchange.exe
app.post('/api/orders', async (req, res) => {
  try {
    const orders = Array.isArray(req.body) ? req.body : [req.body];

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Provide an array of orders.'
      });
    }

    const csvContent = ordersToCSV(orders);
    const reports = await processCsvThroughExchange(csvContent);

    res.json({
      success: true,
      message: 'Orders processed successfully',
      reports
    });
  } catch (error) {
    console.error('Error processing orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing orders: ' + error.message
    });
  }
});

// POST /api/orders/csv — Accept CSV file upload, run through exchange.exe
app.post('/api/orders/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({
        success: false,
        message: 'File must be a CSV file'
      });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const reports = await processCsvThroughExchange(csvContent);

    res.json({
      success: true,
      message: 'CSV orders processed successfully',
      reports
    });
  } catch (error) {
    console.error('Error processing CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing CSV: ' + error.message
    });
  }
});

// GET /api/reports/latest — Return cached reports from last batch
app.get('/api/reports/latest', (req, res) => {
  try {
    res.json(latestBatchReports);
  } catch (error) {
    console.error('Error retrieving reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving reports: ' + error.message
    });
  }
});

// POST /api/reports/clear — Clear cached reports
app.post('/api/reports/clear', (req, res) => {
  latestBatchReports = [];
  res.json({ success: true, message: 'Reports cleared' });
});

// GET /api/health — Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flower Exchange API is running' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌸 Flower Exchange API Server running on http://localhost:${PORT}`);
  console.log(`✓ POST /api/orders       — Submit JSON orders → exchange.exe`);
  console.log(`✓ POST /api/orders/csv   — Upload CSV file    → exchange.exe`);
  console.log(`✓ GET  /api/reports/latest — Get execution reports`);
  console.log(`✓ POST /api/reports/clear  — Clear cached reports`);
  console.log(`\nexchange.exe path: ${EXCHANGE_EXE}`);
});
