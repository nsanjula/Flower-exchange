#pragma once
#include "ValidationRule.hpp"

class PriceValidation : public ValidationRule {
public:
    bool validate(const Order& order, std::string& reason) const override {
        if (order.getPrice() <= 0) {
            reason = "Invalid price";
            return false;
        }
        return true;
    }
};