#pragma once
#include "ValidationRule.hpp"
#include <unordered_set>

class InstrumentValidation : public ValidationRule {
private:
    std::unordered_set<std::string> validInstruments{
        "ROSE", "LAVENDER", "LOTUS", "TULIP", "ORCHID"
    };

public:
    bool validate(const Order& order, std::string& reason) const override {
        if (validInstruments.find(order.getInstrument()) == validInstruments.end()) {
            reason = "Invalid instrument";
            return false;
        }
        return true;
    }
};