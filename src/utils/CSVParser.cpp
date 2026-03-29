#include "CSVParser.hpp"
#include <fstream>
#include <sstream>

std::vector<Order> CSVParser::parse(const std::string& filePath) {
    std::vector<Order> orders;
    std::ifstream file(filePath);

    // Throwing an error if the file opening failed
    if (!file.is_open()) {
        throw std::runtime_error("Failed to open file: " + filePath);
    }

    std::string line;
    std::getline(file, line);

    int sequence = 0;

    // Looping through each line of the CSV file (except the header) and creating an order object and adding it to orders vector
    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string token;
        Order order;

        std::getline(ss, token, ',');
        order.setClientOrderId(token);

        std::getline(ss, token, ',');
        order.setInstrument(token);

        std::getline(ss, token, ',');
        order.setSide(std::stoi(token));

        std::getline(ss, token, ',');
        order.setQuantity(std::stoi(token));

        std::getline(ss, token, ',');
        order.setPrice(std::stod(token));

        order.setSequence(sequence++);

        orders.push_back(order);
    }

    return orders;
}