#pragma once
#include <vector>
#include <memory>
#include "ValidationRule.hpp"

class OrderValidator {
private:
    std::vector<std::unique_ptr<ValidationRule>> rules;     // unique_ptr is a smart pointer so that we don't need to worry about the deletion of the object
    // or else we can std::vector<ValidationRule*> rules; as well. But here we need manually delete the objects after creation

public:
    OrderValidator();

    bool validate(const Order& order, std::string& reason) const;
};