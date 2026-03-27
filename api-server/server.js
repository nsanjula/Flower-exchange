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
let executionReports = [];
let latestBatchReports = [];
let orderBook = {
  buy: [],   // Array of buy orders sorted by price (highest first)
  sell: []   // Array of sell orders sorted by price (lowest first)
};

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
  return 'ORD' + String(orderIdCounter++).padStart(6, '0');
}

function validateOrder(order) {
  // Validate clientOrderId
  if (!order.clientOrderId || typeof order.clientOrderId !== 'string') {
    return { valid: false, reason: 'Invalid clientOrderId' };
  }
  if (!/^[A-Z0-9]{1,7}$/.test(order.clientOrderId)) {
    return { valid: false, reason: 'clientOrderId must be 1-7 alphanumeric characters' };
  }

  // Validate instrument (case-insensitive, stored as uppercase)
  const upperInstrument = order.instrument.toUpperCase();
  if (!['ROSE', 'LAVENDER', 'LOTUS', 'TULIP', 'ORCHID'].includes(upperInstrument)) {
    return { valid: false, reason: `Invalid instrument. Must be one of: ROSE, LAVENDER, LOTUS, TULIP, ORCHID` };
  }

  // Validate side
  if (!SIDES.includes(order.side)) {
    return { valid: false, reason: 'Invalid side. Must be 1 (Buy) or 2 (Sell)' };
  }

  // Validate quantity
  if (typeof order.quantity !== 'number' || order.quantity < 10 || order.quantity > 1000 || order.quantity % 10 !== 0) {
    return { valid: false, reason: 'Quantity must be between 10-1000 and multiple of 10' };
  }

  // Validate price
  if (typeof order.price !== 'number' || order.price <= 0) {
    return { valid: false, reason: 'Price must be greater than 0' };
  }

  return { valid: true };
}

function matchOrders(order) {
  const trades = [];
  let remainingQty = order.quantity;
  const orderId = generateOrderId();
  let matchedQty = 0;
  const upperInstrument = order.instrument.toUpperCase();

  if (order.side === 1) {
    // BUY order - match against sell orders
    while (remainingQty > 0 && orderBook.sell.length > 0) {
      const sellOrder = orderBook.sell[0];

      // Check if instruments match and prices match (buy price >= sell price)
      if (sellOrder.instrument === upperInstrument && order.price >= sellOrder.price) {
        const tradeQty = Math.min(remainingQty, sellOrder.quantity);

        trades.push({
          buyOrderId: orderId,
          sellOrderId: sellOrder.orderId,
          quantity: tradeQty,
          price: sellOrder.price,
          timestamp: getCurrentTime()
        });

        remainingQty -= tradeQty;
        matchedQty += tradeQty;
        sellOrder.quantity -= tradeQty;

        if (sellOrder.quantity === 0) {
          orderBook.sell.shift();
        }
      } else {
        break;
      }
    }

    // Add remaining quantity to buy side
    if (remainingQty > 0) {
      orderBook.buy.push({
        orderId,
        clientOrderId: order.clientOrderId,
        instrument: upperInstrument,
        side: 1,
        price: order.price,
        quantity: remainingQty
      });
      // Sort buy orders by price (highest first)
      orderBook.buy.sort((a, b) => b.price - a.price);
    }
  } else {
    // SELL order - match against buy orders
    while (remainingQty > 0 && orderBook.buy.length > 0) {
      const buyOrder = orderBook.buy[0];

      // Check if instruments match and prices match (buy price >= sell price)
      if (buyOrder.instrument === upperInstrument && buyOrder.price >= order.price) {
        const tradeQty = Math.min(remainingQty, buyOrder.quantity);

        trades.push({
          buyOrderId: buyOrder.orderId,
          sellOrderId: orderId,
          quantity: tradeQty,
          price: order.price,
          timestamp: getCurrentTime()
        });

        remainingQty -= tradeQty;
        matchedQty += tradeQty;
        buyOrder.quantity -= tradeQty;

        if (buyOrder.quantity === 0) {
          orderBook.buy.shift();
        }
      } else {
        break;
      }
    }

    // Add remaining quantity to sell side
    if (remainingQty > 0) {
      orderBook.sell.push({
        orderId,
        clientOrderId: order.clientOrderId,
        instrument: upperInstrument,
        side: 2,
        price: order.price,
        quantity: remainingQty
      });
      // Sort sell orders by price (lowest first)
      orderBook.sell.sort((a, b) => a.price - b.price);
    }
  }

  return {
    orderId,
    matchedQty,
    remainingQty,
    trades
  };
}

function processOrder(order) {
  // Validate order
  const validation = validateOrder(order);
  if (!validation.valid) {
    const report = {
      orderId: '',
      clientOrderId: order.clientOrderId,
      instrument: order.instrument.toUpperCase(),
      side: order.side,
      execStatus: STATUS.REJECTED,
      quantity: order.quantity,
      price: order.price,
      transactionTime: getCurrentTime()
    };
    executionReports.push(report);
    return report;
  }

  // Match order
  const matchResult = matchOrders(order);

  // Determine execution status
  let execStatus = STATUS.NEW;
  if (matchResult.remainingQty === 0) {
    execStatus = STATUS.FILLED;
  } else if (matchResult.matchedQty > 0) {
    execStatus = STATUS.PARTIALLY_FILLED;
  }

  // Create execution report
  const report = {
    orderId: matchResult.orderId,
    clientOrderId: order.clientOrderId,
    instrument: order.instrument.toUpperCase(),
    side: order.side,
    execStatus,
    quantity: order.quantity,
    price: order.price,
    transactionTime: getCurrentTime()
  };

  executionReports.push(report);
  return report;
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
      const report = processOrder(order);
      results.push(report);
      latestBatchReports.push(report);
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
        clientOrderId: record.clientOrderId || record['Cl. Order ID'],
        instrument: record.instrument || record.Instrument,
        side: parseInt(record.side || record.Side),
        quantity: parseInt(record.quantity || record.Quantity),
        price: parseFloat(record.price || record.Price)
      };

      const report = processOrder(order);
      results.push(report);
      latestBatchReports.push(report);
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
  orderBook = { buy: [], sell: [] };
  orderIdCounter = 1;
  res.json({ success: true, message: 'Reports and order book cleared' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌸 Flower Exchange API Server running on http://localhost:${PORT}`);
  console.log(`✓ POST /api/orders - Submit JSON orders`);
  console.log(`✓ POST /api/orders/csv - Upload CSV file`);
  console.log(`✓ GET /api/reports/latest - Get execution reports`);
});
