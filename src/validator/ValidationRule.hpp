#pragma once
#include <string>
#include "../model/Order.hpp"

class ValidationRule {
public:
    virtual ~ValidationRule() = default;

    virtual bool validate(const Order& order, std::string& reason) const = 0;
};