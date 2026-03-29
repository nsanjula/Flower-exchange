#include "MatchingEngine.hpp"
#include <algorithm>

std::vector<Trade> MatchingEngine::processOrder(std::shared_ptr<Order> incoming, const std::string& instrument) {
    std::vector<Trade> trades;

    // Get or create order book for this instrument
    if (orderBooks.find(instrument) == orderBooks.end()) {
        orderBooks[instrument] = OrderBook();
    }

    OrderBook& orderBook = orderBooks[instrument];

    while (orderBook.hasMatch(*incoming)) {

        if (incoming->getSide() == 1) { // BUY
            auto bestSell = orderBook.getBestSell();

            int tradedQty = std::min(incoming->getQuantity(), bestSell->getQuantity());
            double tradePrice = bestSell->getPrice();   // ****

            trades.emplace_back(*incoming, *bestSell, tradedQty, tradePrice);   // creating the Trade object directly inside the vector

            incoming->reduceQuantity(tradedQty);
            bestSell->reduceQuantity(tradedQty);

            orderBook.removeBestSell();     // To maintain the structure of the priority queue

            if (bestSell->getQuantity() > 0) {
                orderBook.addOrder(bestSell);   // Adding that bestsell again (with updated quantities)
            }

        } else { // SELL
            auto bestBuy = orderBook.getBestBuy();

            int tradedQty = std::min(incoming->getQuantity(), bestBuy->getQuantity());
            double tradePrice = bestBuy->getPrice();

            trades.emplace_back(*bestBuy, *incoming, tradedQty, tradePrice);

            incoming->reduceQuantity(tradedQty);
            bestBuy->reduceQuantity(tradedQty);

            orderBook.removeBestBuy();

            if (bestBuy->getQuantity() > 0) {
                orderBook.addOrder(bestBuy);
            }
        }
    }

    // Add remaining quantity to book
    if (incoming->getQuantity() > 0) {
        orderBook.addOrder(incoming);
    }

    return trades;
}


