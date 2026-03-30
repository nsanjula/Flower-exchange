#pragma once

#include <vector>
#include <string>
#include "../model/ExecutionReport.hpp"

class ExecutionReportWriter {
public:
    static void write(const std::string& filePath,
                      const std::vector<ExecutionReport>& reports);
};