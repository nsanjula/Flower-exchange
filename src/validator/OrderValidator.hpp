#pragma once
#include <vector>
#include <memory>
#include "ValidationRule.hpp"

class OrderValidator {
private:
    std::vector<std::unique_ptr<ValidationRule>> rules;

public:
    OrderValidator();

    bool validate(const Order& order, std::string& reason) const;
};