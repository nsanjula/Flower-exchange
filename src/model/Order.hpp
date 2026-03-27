#pragma once

#include <string>

class Order {
    private:
        std::string mClientOrderId;
        std::string mInstrument;
        int mSide;   // 1: buy, 2:sell
        double mPrice;
        int mQuantity;
        int mSequence;

    public:
        // Getters
        std::string getClientOrderId() const { return mClientOrderId; }
        std::string getInstrument() const { return mInstrument; }
        int getSide() const { return mSide; }
        double getPrice() const { return mPrice; }
        int getQuantity() const { return mQuantity; }
        int getSequence() const { return mSequence; }

        // Setters
        void setClientOrderId(const std::string& clientOrderId) { mClientOrderId = clientOrderId; }
        void setInstrument(const std::string& instrument) { mInstrument = instrument; }
        void setSide(int side) { mSide = side; }
        void setPrice(double price) { mPrice = price; }
        void setQuantity(int quantity) { mQuantity = quantity; }
        void setSequence(int sequence) { mSequence = sequence; }

        // Reduce quantity after trade
        void reduceQuantity(int qty) {
            mQuantity -= qty;
        }


};
