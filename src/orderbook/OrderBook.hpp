#pragma once

#include <set>
#include <memory>
#include "../model/Order.hpp"

class OrderBook {
private:
    // Comparator for BUY orders (highest price first)
    struct BuyComparator {
        bool operator()(const std::shared_ptr<Order>& a,
                        const std::shared_ptr<Order>& b) const {
            if (a->getPrice() != b->getPrice())
                return a->getPrice() > b->getPrice(); // higher first

            return a->getSequence() < b->getSequence(); // earlier first
        }
    };

    // Comparator for SELL orders (lowest price first)
    struct SellComparator {
        bool operator()(const std::shared_ptr<Order>& a,
                        const std::shared_ptr<Order>& b) const {
            if (a->getPrice() != b->getPrice())
                return a->getPrice() < b->getPrice(); // lower first

            return a->getSequence() < b->getSequence();
        }
    };

    std::multiset<std::shared_ptr<Order>, BuyComparator> buyOrders;
    std::multiset<std::shared_ptr<Order>, SellComparator> sellOrders;

public:
    // Add order to book
    void addOrder(const std::shared_ptr<Order>& order);

    // Check if match is possible
    bool hasMatch(const Order& incoming) const;

    // Get best orders
    std::shared_ptr<Order> getBestBuy() const;
    std::shared_ptr<Order> getBestSell() const;

    // Remove best orders
    void removeBestBuy();
    void removeBestSell();

    // Check if empty
    bool hasBuyOrders() const;
    bool hasSellOrders() const;
};