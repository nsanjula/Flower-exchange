#pragma once
#include "Order.hpp"

class Trade {
private:
    std::string buyOrderId;
    std::string sellOrderId;
    double price;
    int quantity;

public:
    Trade(const Order& buy, const Order& sell, int qty, double p)
        : buyOrderId(buy.getClientOrderId()),
          sellOrderId(sell.getClientOrderId()),
          price(p),
          quantity(qty) {}
};

