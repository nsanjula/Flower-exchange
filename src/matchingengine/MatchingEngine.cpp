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
            double execPrice = bestSell->getPrice(); // passive price

            incoming->reduceQuantity(tradedQty);
            bestSell->reduceQuantity(tradedQty);

            int aggressiveRemaining = incoming->getQuantity();
            int passiveRemaining = bestSell->getQuantity();

            // Emit one match event (to be expanded into 2 execution reports by Exchange)
            trades.emplace_back(*incoming, *bestSell, tradedQty, execPrice, aggressiveRemaining, passiveRemaining);

            orderBook.removeBestSell();     // To maintain the structure of the priority queue

            if (passiveRemaining > 0) {
                orderBook.addOrder(bestSell);   // Adding that bestsell again (with updated quantities)
            }

        } else { // SELL
            auto bestBuy = orderBook.getBestBuy();

            int tradedQty = std::min(incoming->getQuantity(), bestBuy->getQuantity());
            double execPrice = bestBuy->getPrice(); // passive price

            incoming->reduceQuantity(tradedQty);
            bestBuy->reduceQuantity(tradedQty);

            int aggressiveRemaining = incoming->getQuantity();
            int passiveRemaining = bestBuy->getQuantity();

            trades.emplace_back(*incoming, *bestBuy, tradedQty, execPrice, aggressiveRemaining, passiveRemaining);

            orderBook.removeBestBuy();

            if (passiveRemaining > 0) {
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


