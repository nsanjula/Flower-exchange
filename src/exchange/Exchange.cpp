#include "Exchange.hpp"

#include <memory>
#include <ctime>
#include <sstream>

Exchange::Exchange() : orderIdCounter(1) {}

std::string Exchange::generateOrderId() {
    return "ORD" + std::to_string(orderIdCounter++);
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
    std::string orderId = generateOrderId();

    // Validate
    if (!validator.validate(order, reason)) {

        ExecutionReport report(
            order.getClientOrderId(),
            orderId, 
            order.getInstrument(),
            order.getSide(),
            order.getPrice(),
            order.getQuantity(),
            1, // REJECTED
            reason,
            getCurrentTime()
        );

        reports.push_back(report);
        return;
    }

    // For a valid order

    // Convert to shared_ptr (required by MatchingEngine)
    // Shared pointers are used because multiple classes will poitn to this Order object
    // Also they are smart pointers which will be deleted automatically after no one is pointing to that 
    auto orderPtr = std::make_shared<Order>(order);

    int originalQty = orderPtr->getQuantity();

    // Matching
    auto trades = engine.processOrder(orderPtr, order.getInstrument());

    int remainingQty = orderPtr->getQuantity();

    // Create execution report for each trade
    for (const auto& trade : trades) {
        ExecutionReport tradeReport(
            order.getClientOrderId(),
            orderId,
            order.getInstrument(),
            order.getSide(),
            trade.getPrice(),
            trade.getQuantity(),
            2, // FILLED (each trade is a partial fill execution)
            "",
            getCurrentTime()
        );
        reports.push_back(tradeReport);
    }

    // Create final execution report for remaining quantity
    if (remainingQty > 0) {
        int finalStatus;
        if (remainingQty < originalQty) {
            finalStatus = 3; // PARTIALLY_FILLED
        } else {
            finalStatus = 0; // NEW (no matches, added to book)
        }

        ExecutionReport finalReport(
            order.getClientOrderId(),
            orderId,
            order.getInstrument(),
            order.getSide(),
            order.getPrice(),
            remainingQty,
            finalStatus,
            "",
            getCurrentTime()
        );
        reports.push_back(finalReport);
    } else if (trades.empty()) {
        // If no trades occurred but no remaining qty (shouldn't happen), report as FILLED
        ExecutionReport finalReport(
            order.getClientOrderId(),
            orderId,
            order.getInstrument(),
            order.getSide(),
            order.getPrice(),
            originalQty,
            2, // FILLED
            "",
            getCurrentTime()
        );
        reports.push_back(finalReport);
    }
}

const std::vector<ExecutionReport>& Exchange::getReports() const {
    return reports;
}