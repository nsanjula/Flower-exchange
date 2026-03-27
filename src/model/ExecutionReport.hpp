// #pragma once

// #include <string>

// class ExecutionReport {
//     private:
//         std::string mClientOrderId;
//         std::string mOrderId;
//         std::string mInstrument;
//         int mSide;   // 1: buy, 2:sell
//         double mPrice;
//         int mQuantity;
//         int mStatus;
//         std::string mReason;
//         std::string mTransactionTime;

// };

#pragma once

#include <string>

class ExecutionReport {
private:
    std::string mClientOrderId;
    std::string mOrderId;
    std::string mInstrument;
    int mSide;   // 1: buy, 2:sell
    double mPrice;
    int mQuantity;
    int mStatus;
    std::string mReason;
    std::string mTransactionTime;

public:
    // Constructor
    ExecutionReport(const std::string& clientOrderId,
                    const std::string& orderId,
                    const std::string& instrument,
                    int side,
                    double price,
                    int quantity,
                    int status,
                    const std::string& reason,
                    const std::string& transactionTime)
        : mClientOrderId(clientOrderId),
          mOrderId(orderId),
          mInstrument(instrument),
          mSide(side),
          mPrice(price),
          mQuantity(quantity),
          mStatus(status),
          mReason(reason),
          mTransactionTime(transactionTime) {}

    // Getters
    std::string getClientOrderId() const { return mClientOrderId; }
    std::string getOrderId() const { return mOrderId; }
    std::string getInstrument() const { return mInstrument; }
    int getSide() const { return mSide; }
    double getPrice() const { return mPrice; }
    int getQuantity() const { return mQuantity; }
    int getStatus() const { return mStatus; }
    std::string getReason() const { return mReason; }
    std::string getTransactionTime() const { return mTransactionTime; }
};



