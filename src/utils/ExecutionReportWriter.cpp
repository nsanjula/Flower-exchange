#include "ExecutionReportWriter.hpp"
#include <fstream>

void ExecutionReportWriter::write(const std::string& filePath,
                                  const std::vector<ExecutionReport>& reports) {
    std::ofstream file(filePath);

    // Write header
    file << "ClientOrderId,OrderId,Instrument,Side,Price,Quantity,Status,Reason,TransactionTime\n";

    for (const auto& report : reports) {
        file << report.getClientOrderId() << ","
             << report.getOrderId() << ","
             << report.getInstrument() << ","
             << report.getSide() << ","
             << report.getPrice() << ","
             << report.getQuantity() << ","
             << report.getStatus() << ","
             << report.getReason() << ","
             << report.getTransactionTime()
             << "\n";
    }

    file.close();
}