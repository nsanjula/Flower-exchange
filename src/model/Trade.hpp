#pragma once
#include "Order.hpp"

class Trade {
private:
    // Aggressive (incoming) order details
    std::string aggressiveClientOrderId;
    std::string aggressiveOrderId;
    int aggressiveSide;
    int aggressiveRemainingAfter;

    // Passive (resting) order details
    std::string passiveClientOrderId;
    std::string passiveOrderId;
    int passiveSide;
    int passiveRemainingAfter;

    // Execution details for this match event
    double executionPrice; // always passive's price
    int matchedQuantity;

public:
    Trade(const Order& aggressive,
          const Order& passive,
          int matchedQty,
          double execPrice,
          int aggressiveRemaining,
          int passiveRemaining)
        : aggressiveClientOrderId(aggressive.getClientOrderId()),
          aggressiveOrderId(aggressive.getOrderId()),
          aggressiveSide(aggressive.getSide()),
          aggressiveRemainingAfter(aggressiveRemaining),
          passiveClientOrderId(passive.getClientOrderId()),
          passiveOrderId(passive.getOrderId()),
          passiveSide(passive.getSide()),
          passiveRemainingAfter(passiveRemaining),
          executionPrice(execPrice),
          matchedQuantity(matchedQty) {}

    // Getters
    const std::string& getAggressiveClientOrderId() const { return aggressiveClientOrderId; }
    const std::string& getAggressiveOrderId() const { return aggressiveOrderId; }
    int getAggressiveSide() const { return aggressiveSide; }
    int getAggressiveRemainingAfter() const { return aggressiveRemainingAfter; }

    const std::string& getPassiveClientOrderId() const { return passiveClientOrderId; }
    const std::string& getPassiveOrderId() const { return passiveOrderId; }
    int getPassiveSide() const { return passiveSide; }
    int getPassiveRemainingAfter() const { return passiveRemainingAfter; }

    double getExecutionPrice() const { return executionPrice; }
    int getMatchedQuantity() const { return matchedQuantity; }
};

