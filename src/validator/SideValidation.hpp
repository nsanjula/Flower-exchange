#pragma once
#include "ValidationRule.hpp"

class SideValidation : public ValidationRule {
public:
    bool validate(const Order& order, std::string& reason) const override {
        if (order.getSide() != 1 && order.getSide() != 2) {
            reason = "Invalid side";
            return false;
        }
        return true;
    }
};