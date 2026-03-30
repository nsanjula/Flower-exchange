#include "Exchange.hpp"

#include <memory>
#include <ctime>
#include <sstream>

Exchange::Exchange() : orderIdCounter(1) {}

std::string Exchange::generateOrderId() {
    return "ord" + std::to_string(orderIdCounter++);
}

std::string Exchange::getCurrentTime() const {
    std::time_t now = std::time(nullptr);
    std::tm* tmPtr = std::localtime(&now);

    char buffer[20];
    std::strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", tmPtr);

    return std::string(buffer);
}

void Exchange::processOrder(const Order& order) {
    std::string reason;

    // Validate
    if (!validator.validate(order, reason)) {
        // Rejected orders never consume a system OrderID and do not touch the book.
        const std::string emptyOrderId = "";

        ExecutionReport report(
            order.getClientOrderId(),
            emptyOrderId, 
            order.getInstrument(),
            order.getSide(),
            order.getPrice(),
            order.getQuantity(),
            "Rejected",
            reason,
            getCurrentTime()
        );

        reports.push_back(report);
        return;
    }

    // For a valid order
    std::string orderId = generateOrderId();

    // Convert to shared_ptr (required by MatchingEngine)
    // Shared pointers are used because multiple classes will poitn to this Order object
    // Also they are smart pointers which will be deleted automatically after no one is pointing to that 
    auto orderPtr = std::make_shared<Order>(order);
    orderPtr->setOrderId(orderId); // assign system OrderID to this (incoming) order

    int originalQty = orderPtr->getQuantity();

    // Matching
    auto trades = engine.processOrder(orderPtr, order.getInstrument());

    // Emit execution reports exactly as specified.
    // - No match => one "New" report for the aggressive order (full original quantity).
    // - Each match event => immediately emit 2 reports (aggressive + passive), with correct Fill/PFill.
    if (trades.empty()) {
        ExecutionReport newReport(
            order.getClientOrderId(),
            orderId,
            order.getInstrument(),
            order.getSide(),
            order.getPrice(),
            originalQty,
            "New",
            "",
            getCurrentTime()
        );
        reports.push_back(newReport);
        return;
    }

    for (const auto& trade : trades) {
        const std::string ts = getCurrentTime();

        // Aggressive (incoming) side execution report
        ExecutionReport aggressiveReport(
            trade.getAggressiveClientOrderId(),
            trade.getAggressiveOrderId(),
            order.getInstrument(),
            trade.getAggressiveSide(),
            trade.getExecutionPrice(), // execution price is always passive's price
            trade.getMatchedQuantity(),
            trade.getAggressiveRemainingAfter() == 0 ? "Fill" : "PFill",
            "",
            ts
        );
        reports.push_back(aggressiveReport);

        // Passive (resting) side execution report
        ExecutionReport passiveReport(
            trade.getPassiveClientOrderId(),
            trade.getPassiveOrderId(),
            order.getInstrument(),
            trade.getPassiveSide(),
            trade.getExecutionPrice(), // execution price is always passive's price
            trade.getMatchedQuantity(),
            trade.getPassiveRemainingAfter() == 0 ? "Fill" : "PFill",
            "",
            ts
        );
        reports.push_back(passiveReport);
    }
}

const std::vector<ExecutionReport>& Exchange::getReports() const {
    return reports;
}