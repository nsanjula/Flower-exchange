#pragma once
#include "ValidationRule.hpp"

class QuantityValidation : public ValidationRule {
public:
    bool validate(const Order& order, std::string& reason) const override {

        if (order.getQuantity() < 10 || order.getQuantity() > 1000) {
            reason = "Quantity out of range";
            return false;
        }

        if (order.getQuantity() % 10 != 0) {
            reason = "Quantity must be multiple of 10";
            return false;
        }

        return true;
    }
};