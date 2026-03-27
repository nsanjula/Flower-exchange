// std::vector<Trade> MatchingEngine::processOrder(Order incoming) {
//     std::vector<Trade> trades;

//     while (incoming.getQuantity() > 0 &&
//            orderBook.hasMatchingOrder(incoming)) {

//         if (incoming.getSide() == 1) { // BUY
//             Order bestSell = orderBook.getBestSell();

//             int tradedQty = std::min(incoming.getQuantity(), bestSell.getQuantity());

//             // price = existing order price
//             double tradePrice = bestSell.getPrice();

//             trades.emplace_back(incoming, bestSell, tradedQty, tradePrice);

//             // update quantities
//             incoming.reduceQuantity(tradedQty);
//             bestSell.reduceQuantity(tradedQty);

//             orderBook.removeBestSell();

//             if (bestSell.getQuantity() > 0) {
//                 orderBook.addOrder(bestSell);
//             }

//         } else { // SELL
//             Order bestBuy = orderBook.getBestBuy();

//             int tradedQty = std::min(incoming.getQuantity(), bestBuy.getQuantity());
//             double tradePrice = bestBuy.getPrice();

//             trades.emplace_back(bestBuy, incoming, tradedQty, tradePrice);

//             incoming.reduceQuantity(tradedQty);
//             bestBuy.reduceQuantity(tradedQty);

//             orderBook.removeBestBuy();

//             if (bestBuy.getQuantity() > 0) {
//                 orderBook.addOrder(bestBuy);
//             }
//         }
//     }

//     // Remaining quantity → add to book
//     if (incoming.getQuantity() > 0) {
//         orderBook.addOrder(incoming);
//     }

//     return trades;
// }




#include "MatchingEngine.hpp"
#include <algorithm>

std::vector<Trade> MatchingEngine::processOrder(std::shared_ptr<Order> incoming) {
    std::vector<Trade> trades;

    while (incoming->getQuantity() > 0 &&
           orderBook.hasMatch(*incoming)) {

        if (incoming->getSide() == 1) { // BUY
            auto bestSell = orderBook.getBestSell();

            int tradedQty = std::min(incoming->getQuantity(), bestSell->getQuantity());
            double tradePrice = bestSell->getPrice();

            trades.emplace_back(*incoming, *bestSell, tradedQty, tradePrice);

            incoming->reduceQuantity(tradedQty);
            bestSell->reduceQuantity(tradedQty);

            orderBook.removeBestSell();

            if (bestSell->getQuantity() > 0) {
                orderBook.addOrder(bestSell);
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


