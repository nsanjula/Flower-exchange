#pragma once
#include "../orderbook/OrderBook.hpp"
#include "../model/Trade.hpp"
#include <vector>
#include <map>
#include <string>
#include <memory>

class MatchingEngine {
private:
    std::map<std::string, OrderBook> orderBooks;

public:
    std::vector<Trade> processOrder(std::shared_ptr<Order> incoming, const std::string& instrument);
};