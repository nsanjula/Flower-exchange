#pragma once
#include <string>
#include "../model/Order.hpp"

class ValidationRule {
public:
    virtual ~ValidationRule() = default;   

    // By using virtual destrucyor we are making sure that both the destructors in base class and 
    // derrived class are called when deleting an object.
    // If we don't use virtual destructor here, it will only call the destructor which the pointer type specifies
    // Example:- ValidattionRule* rule = new InstrumentValidatio(); and delete rule;
    // Without virtual, it will only call the destructor in Validation rule class
    // With virtual it will call the destrcutors in the order of ~InstrumentValidation() and ~ValidattionRule()

    virtual bool validate(const Order& order, std::string& reason) const = 0;   // Here the const after the method signature says that the ValidationRule object used
    // Call this function will not be changed during the method execution
};