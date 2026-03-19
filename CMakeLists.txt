cmake_minimum_required(VERSION 3.10)
project(ExchangeProject)

set(CMAKE_CXX_STANDARD 17)

file(GLOB SRC_FILES
    src/*.cpp
)

add_executable(exchange ${SRC_FILES})