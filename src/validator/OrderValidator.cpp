#include "OrderValidator.hpp"
#include "InstrumentValidation.hpp"
#include "PriceValidation.hpp"
#include "QuantityValidation.hpp"
#include "SideValidation.hpp"

OrderValidator::OrderValidator() {
    rules.push_back(std::make_unique<InstrumentValidation>());
    rules.push_back(std::make_unique<PriceValidation>());
    rules.push_back(std::make_unique<QuantityValidation>());
    rules.push_back(std::make_unique<SideValidation>());
}

bool OrderValidator::validate(const Order& order, std::string& reason) const {
    for (const auto& rule : rules) {
        if (!rule->validate(order, reason)) {
            return false; // first failure 
        }
    }
    return true;
}