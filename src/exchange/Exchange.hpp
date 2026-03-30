#pragma once

#include "../validator/OrderValidator.hpp"
#include "../matchingengine/MatchingEngine.hpp"
#include "../model/ExecutionReport.hpp"

#include <vector>
#include <string>

class Exchange {
private:
    OrderValidator validator;
    MatchingEngine engine;

    int orderIdCounter;

    std::vector<ExecutionReport> reports;

    std::string generateOrderId();
    std::string getCurrentTime() const;

public:
    Exchange();

    void processOrder(const Order& order);

    const std::vector<ExecutionReport>& getReports() const;
};