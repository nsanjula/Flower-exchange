#pragma once    // This allows us to prevent including this file header multiple times

#include <vector>
#include <string>
#include "../model/Order.hpp"

class CSVParser {
public:
    static std::vector<Order> parse(const std::string& filePath);
};