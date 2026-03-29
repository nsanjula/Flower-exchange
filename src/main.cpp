// #include "utils/CSVParser.hpp"
// #include "utils/ExecutionReportWriter.hpp"
// #include "exchange/Exchange.hpp"
// #include "model/Order.hpp"

// #include <iostream>
// #include <vector>

// int main() {
//     const std::string inputFile = "../data/orders.csv";
//     const std::string outputFile = "../output/execution_report.csv";

//     // Step 1: Parse CSV
//     std::vector<Order> orders = CSVParser::parse(inputFile);

//     if (orders.empty()) {
//         std::cout << "No orders found in input file.\n";
//         return 0;
//     }

//     // Step 2: Create Exchange
//     Exchange exchange;

//     // Step 3: Process Orders
//     for (const auto& order : orders) {
//         exchange.processOrder(order);
//     }

//     // Step 4: Get Execution Reports
//     const auto& reports = exchange.getReports();

//     // Step 5: Write Output CSV
//     ExecutionReportWriter::write(outputFile, reports);

//     std::cout << "Processing completed.\n";
//     std::cout << "Execution report written to: " << outputFile << "\n";

//     return 0;
// }



#include "utils/CSVParser.hpp"
#include "utils/ExecutionReportWriter.hpp"
#include "exchange/Exchange.hpp"
#include "model/Order.hpp"  

#include <iostream>
#include <vector>
#include <stdexcept>

int main() {
    std::string filename;

    // Get input filename from user
    std::cout << "Enter input CSV filename (e.g., test_case_1_basic.csv): ";
    std::getline(std::cin, filename);

    if (filename.empty()) {
        std::cerr << "ERROR: Filename cannot be empty.\n";
        return 1;
    }

    // Construct full input file path
    const std::string inputFile = "../data/" + filename;
    const std::string outputFile = "../output/execution_report.csv";

    try {
        // Step 1: Parse CSV
        std::vector<Order> orders = CSVParser::parse(inputFile);

        for (const auto& order : orders) {
            std::cout << order.getClientOrderId() << "\n";
            std::cout << order.getInstrument() << "\n";
            std::cout << order.getPrice() << "\n";
            std::cout << order.getQuantity() << "\n";
            std::cout << order.getSide() << "\n";
            std::cout << order.getSequence() << "\n";
            std::cout << "\n";
        }

        if (orders.empty()) {
            std::cerr << "ERROR: No orders found in input file.\n";  
            return 1;
        }

        std::cout << "Successfully parsed " << orders.size() << " orders from input file.\n";

        // Step 2: Create Exchange
        Exchange exchange;

        // Step 3: Process Orders
        for (const auto& order : orders) {
            exchange.processOrder(order);
        }

        // Step 4: Get Execution Reports
        const auto& reports = exchange.getReports();

        // Step 5: Write Output CSV
        ExecutionReportWriter::write(outputFile, reports);

        std::cout << "Processing completed.\n";
        std::cout << "Execution report written to: " << outputFile << "\n";
        std::cout << "Total execution reports: " << reports.size() << "\n";

    } catch (const std::exception& e) {
        std::cerr << "ERROR: " << e.what() << "\n";
        return 1;
    }

    return 0;
}