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

    // Step 1: Validate
    if (!validator.validate(order, reason)) {

        ExecutionReport report(
            order.getClientOrderId(),
            "", // No OrderId for rejected
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

    // Step 2: Valid order
    std::string orderId = generateOrderId();

    // Convert to shared_ptr (required by MatchingEngine)
    auto orderPtr = std::make_shared<Order>(order);

    int originalQty = orderPtr->getQuantity();

    // Step 3: Matching
    auto trades = engine.processOrder(orderPtr);

    int remainingQty = orderPtr->getQuantity();

    int status;
    std::string reasonText = "";

    if (remainingQty == 0) {
        status = 2; // FILLED
    } else if (remainingQty < originalQty) {
        status = 3; // PARTIALLY_FILLED
    } else {
        status = 0; // NEW (no match, added to book)
    }

    // Step 4: Create ExecutionReport
    ExecutionReport report(
        order.getClientOrderId(),
        orderId,
        order.getInstrument(),
        order.getSide(),
        order.getPrice(),
        originalQty,
        status,
        reasonText,
        getCurrentTime()
    );

    reports.push_back(report);
}

const std::vector<ExecutionReport>& Exchange::getReports() const {
    return reports;
}