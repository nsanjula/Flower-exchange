const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// In-memory storage
let orderIdCounter = 1;
let arrivalSeqCounter = 1;
let executionReports = [];
let latestBatchReports = [];
function createEmptyOrderBooks() {
  return {
    ROSE: { buy: [], sell: [] },
    LAVENDER: { buy: [], sell: [] },
    LOTUS: { buy: [], sell: [] },
    TULIP: { buy: [], sell: [] },
    ORCHID: { buy: [], sell: [] }
  };
}

let orderBook = createEmptyOrderBooks();

// Status codes
const STATUS = {
  NEW: 'New',
  FILLED: 'Fill',
  PARTIALLY_FILLED: 'PFill',
  REJECTED: 'Rejected'
};

// Validation rules
const SIDES = [1, 2]; // 1: Buy, 2: Sell

function getCurrentTime() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

function generateOrderId() {
  return 'ord' + orderIdCounter++;
}

function validateOrder(order) {
  if (!order || typeof order !== 'object') {
    return { valid: false, reason: 'Invalid order payload' };
  }

  const { clientOrderId, instrument, side, quantity, price } = order;

  // Validate required fields
  if (clientOrderId === undefined || clientOrderId === null || typeof clientOrderId !== 'string' || clientOrderId.trim() === '') {
    return { valid: false, reason: 'Invalid clientOrderId' };
  }
  if (!/^[A-Z0-9]{1,7}$/.test(clientOrderId)) {
    return { valid: false, reason: 'clientOrderId must be 1-7 alphanumeric characters' };
  }

  if (instrument === undefined || instrument === null || typeof instrument !== 'string' || instrument.trim() === '') {
    return { valid: false, reason: 'Invalid instrument' };
  }
  const upperInstrument = instrument.toUpperCase();
  if (!['ROSE', 'LAVENDER', 'LOTUS', 'TULIP', 'ORCHID'].includes(upperInstrument)) {
    return { valid: false, reason: `Invalid instrument. Must be one of: ROSE, LAVENDER, LOTUS, TULIP, ORCHID` };
  }

  if (!SIDES.includes(side)) {
    return { valid: false, reason: 'Invalid side. Must be 1 (Buy) or 2 (Sell)' };
  }

  if (typeof quantity !== 'number' || Number.isNaN(quantity) || quantity < 10 || quantity > 1000 || quantity % 10 !== 0) {
    return { valid: false, reason: 'Quantity must be between 10-1000 and multiple of 10' };
  }

  if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
    return { valid: false, reason: 'Price must be greater than 0' };
  }

  return { valid: true, upperInstrument };
}

function compareBuyOrders(a, b) {
  // Highest price first, then earliest arrival (lower seq first)
  if (a.price !== b.price) return b.price - a.price;
  return a.seq - b.seq;
}

function compareSellOrders(a, b) {
  // Lowest price first, then earliest arrival (lower seq first)
  if (a.price !== b.price) return a.price - b.price;
  return a.seq - b.seq;
}

function matchIncomingAgainstBook(order, orderId, seq, upperInstrument) {
  const book = orderBook[upperInstrument];
  let remainingQty = order.quantity;
  let matchedAny = false;
  const reports = [];

  while (remainingQty > 0) {
    if (order.side === 1) {
      // Incoming BUY: match against best SELL (lowest price)
      if (book.sell.length === 0) break;
      const passive = book.sell[0];

      // Match condition: buy_price >= sell_price
      if (order.price < passive.price) break;

      const execPrice = passive.price;
      const tradeQty = Math.min(remainingQty, passive.quantity);

      remainingQty -= tradeQty;
      passive.quantity -= tradeQty;
      matchedAny = true;

      const ts = getCurrentTime();
      const aggressiveStatus = remainingQty === 0 ? STATUS.FILLED : STATUS.PARTIALLY_FILLED;
      const passiveStatus = passive.quantity === 0 ? STATUS.FILLED : STATUS.PARTIALLY_FILLED;

      // Aggressive (incoming) execution report
      reports.push({
        orderId,
        clientOrderId: order.clientOrderId,
        instrument: upperInstrument,
        side: order.side,
        execStatus: aggressiveStatus,
        quantity: tradeQty,
        price: execPrice,
        transactionTime: ts
      });

      // Passive execution report
      reports.push({
        orderId: passive.orderId,
        clientOrderId: passive.clientOrderId,
        instrument: upperInstrument,
        side: passive.side,
        execStatus: passiveStatus,
        quantity: tradeQty,
        price: execPrice,
        transactionTime: ts
      });

      // Remove passive order if fully filled
      if (passive.quantity === 0) {
        book.sell.shift();
      }
    } else {
      // Incoming SELL: match against best BUY (highest price)
      if (book.buy.length === 0) break;
      const passive = book.buy[0];

      // Match condition: buy_price >= sell_price
      if (passive.price < order.price) break;

      const execPrice = passive.price;
      const tradeQty = Math.min(remainingQty, passive.quantity);

      remainingQty -= tradeQty;
      passive.quantity -= tradeQty;
      matchedAny = true;

      const ts = getCurrentTime();
      const aggressiveStatus = remainingQty === 0 ? STATUS.FILLED : STATUS.PARTIALLY_FILLED;
      const passiveStatus = passive.quantity === 0 ? STATUS.FILLED : STATUS.PARTIALLY_FILLED;

      // Aggressive (incoming) execution report
      reports.push({
        orderId,
        clientOrderId: order.clientOrderId,
        instrument: upperInstrument,
        side: order.side,
        execStatus: aggressiveStatus,
        quantity: tradeQty,
        price: execPrice,
        transactionTime: ts
      });

      // Passive execution report
      reports.push({
        orderId: passive.orderId,
        clientOrderId: passive.clientOrderId,
        instrument: upperInstrument,
        side: passive.side,
        execStatus: passiveStatus,
        quantity: tradeQty,
        price: execPrice,
        transactionTime: ts
      });

      if (passive.quantity === 0) {
        book.buy.shift();
      }
    }
  }

  return { matchedAny, remainingQty, reports };
}

function processOrder(order) {
  const validation = validateOrder(order);
  if (!validation.valid) {
    const report = {
      orderId: '',
      clientOrderId: order && order.clientOrderId ? order.clientOrderId : '',
      instrument: typeof order?.instrument === 'string' ? order.instrument.toUpperCase() : '',
      side: order?.side ?? '',
      execStatus: STATUS.REJECTED,
      quantity: order?.quantity ?? '',
      price: order?.price ?? '',
      transactionTime: getCurrentTime()
    };
    executionReports.push(report);
    return [report];
  }

  const upperInstrument = validation.upperInstrument;
  const orderId = generateOrderId();
  const seq = arrivalSeqCounter++;
  const originalQty = order.quantity;

  // Perform matching and emit per-match execution report pairs.
  const matchResult = matchIncomingAgainstBook(order, orderId, seq, upperInstrument);
  const reports = matchResult.reports;

  // If anything is left, it rests on the book with the original arrival priority.
  if (matchResult.remainingQty > 0) {
    const restingOrder = {
      orderId,
      clientOrderId: order.clientOrderId,
      instrument: upperInstrument,
      side: order.side,
      price: order.price,
      quantity: matchResult.remainingQty,
      seq
    };

    const book = orderBook[upperInstrument];
    if (order.side === 1) {
      book.buy.push(restingOrder);
      book.buy.sort(compareBuyOrders);
    } else {
      book.sell.push(restingOrder);
      book.sell.sort(compareSellOrders);
    }
  }

  // Emit one "New" report only when there are zero matches.
  if (!matchResult.matchedAny) {
    reports.push({
      orderId,
      clientOrderId: order.clientOrderId,
      instrument: upperInstrument,
      side: order.side,
      execStatus: STATUS.NEW,
      quantity: originalQty,
      price: order.price,
      transactionTime: getCurrentTime()
    });
  }

  executionReports.push(...reports);
  return reports;
}

// API Endpoints

// POST /api/orders - Accept JSON orders
app.post('/api/orders', (req, res) => {
  try {
    const orders = Array.isArray(req.body) ? req.body : [req.body];

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Provide an array of orders.'
      });
    }

    const results = [];
    latestBatchReports = []; // Clear previous batch

    for (const order of orders) {
      const reports = processOrder(order);
      results.push(...reports);
      latestBatchReports.push(...reports);
    }

    res.json({
      success: true,
      message: 'Orders processed successfully',
      reports: results
    });
  } catch (error) {
    console.error('Error processing orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing orders: ' + error.message
    });
  }
});

// POST /api/orders/csv - Accept CSV file upload
app.post('/api/orders/csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!req.file.originalname.endsWith('.csv')) {
      return res.status(400).json({
        success: false,
        message: 'File must be a CSV file'
      });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty'
      });
    }

    const results = [];
    latestBatchReports = []; // Clear previous batch

    for (const record of records) {
      const order = {
        clientOrderId: record.clientOrderId || record['Cl. Order ID'] || record['Cl.Ord.ID'],
        instrument: record.instrument || record.Instrument,
        side: parseInt(record.side || record.Side),
        quantity: parseInt(record.quantity || record.Quantity),
        price: parseFloat(record.price || record.Price)
      };

      const reports = processOrder(order);
      results.push(...reports);
      latestBatchReports.push(...reports);
    }

    res.json({
      success: true,
      message: 'CSV orders processed successfully',
      reports: results
    });
  } catch (error) {
    console.error('Error processing CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing CSV: ' + error.message
    });
  }
});

// GET /api/reports/latest - Retrieve execution reports from latest batch
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

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flower Exchange API is running' });
});

// Clear reports endpoint (for testing)
app.post('/api/reports/clear', (req, res) => {
  executionReports = [];
  latestBatchReports = [];
  orderBook = createEmptyOrderBooks();
  orderIdCounter = 1;
  arrivalSeqCounter = 1;
  res.json({ success: true, message: 'Reports and order book cleared' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌸 Flower Exchange API Server running on http://localhost:${PORT}`);
  console.log(`✓ POST /api/orders - Submit JSON orders`);
  console.log(`✓ POST /api/orders/csv - Upload CSV file`);
  console.log(`✓ GET /api/reports/latest - Get execution reports`);
});
