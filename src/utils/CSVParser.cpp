#include "CSVParser.hpp"
#include <fstream>
#include <sstream>

std::vector<Order> CSVParser::parse(const std::string& filePath) {
    std::vector<Order> orders;
    std::ifstream file(filePath);

    std::string line;
    std::getline(file, line);

    int sequence = 0;

    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string token;
        Order o;

        std::getline(ss, token, ',');
        o.setClientOrderId(token);

        std::getline(ss, token, ',');
        o.setInstrument(token);

        std::getline(ss, token, ',');
        o.setSide((token == "BUY") ? 1 : 2);

        std::getline(ss, token, ',');
        o.setQuantity(std::stoi(token));

        std::getline(ss, token, ',');
        o.setPrice(std::stod(token));

        o.setSequence(sequence++);

        orders.push_back(o);
    }

    return orders;
}