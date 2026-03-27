// #pragma once
// #include "../orderbook/OrderBook.hpp"
// #include "../model/Trade.hpp"
// #include <vector>

// class MatchingEngine {
// private:
//     OrderBook orderBook;

// public:
//     std::vector<Trade> processOrder(Order order);
// };

#pragma once
#include "../orderbook/OrderBook.hpp"
#include "../model/Trade.hpp"
#include <vector>
#include <memory>

class MatchingEngine {
private:
    OrderBook orderBook;

public:
    std::vector<Trade> processOrder(std::shared_ptr<Order> incoming);
};