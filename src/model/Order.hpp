#pragma once

#include <string>

class Order {
    private:
        std::string mClientOrderId;
        std::string mInstrument;
        int mSide;   // 1: buy, 2:sell
        double mPrice;
        int mQuantity;

    public:
        
};
