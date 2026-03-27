#include "OrderBook.hpp"

void OrderBook::addOrder(const std::shared_ptr<Order>& order) {
    if (order->getSide() == 1) { // BUY
        buyOrders.insert(order);
    } else { // SELL
        sellOrders.insert(order);
    }
}

bool OrderBook::hasMatch(const Order& incoming) const {
    if (incoming.getSide() == 1) { // BUY
        if (sellOrders.empty()) return false;

        auto bestSell = *sellOrders.begin();
        return incoming.getPrice() >= bestSell->getPrice();

    } else { // SELL
        if (buyOrders.empty()) return false;

        auto bestBuy = *buyOrders.begin();
        return incoming.getPrice() <= bestBuy->getPrice();
    }
}

std::shared_ptr<Order> OrderBook::getBestBuy() const {
    if (buyOrders.empty()) return nullptr;
    return *buyOrders.begin();
}

std::shared_ptr<Order> OrderBook::getBestSell() const {
    if (sellOrders.empty()) return nullptr;
    return *sellOrders.begin();
}

void OrderBook::removeBestBuy() {
    if (!buyOrders.empty()) {
        buyOrders.erase(buyOrders.begin());
    }
}

void OrderBook::removeBestSell() {
    if (!sellOrders.empty()) {
        sellOrders.erase(sellOrders.begin());
    }
}

bool OrderBook::hasBuyOrders() const {
    return !buyOrders.empty();
}

bool OrderBook::hasSellOrders() const {
    return !sellOrders.empty();
}