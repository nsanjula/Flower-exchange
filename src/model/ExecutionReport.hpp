#pragma once

#include <string>

class ExecutioReport {
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

};



