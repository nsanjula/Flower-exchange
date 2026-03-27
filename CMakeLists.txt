# cmake_minimum_required(VERSION 3.10)
# project(ExchangeProject)

# set(CMAKE_CXX_STANDARD 17)

# file(GLOB SRC_FILES
#     src/*.cpp
# )

# add_executable(exchange ${SRC_FILES})

cmake_minimum_required(VERSION 3.10)
project(ExchangeProject)

set(CMAKE_CXX_STANDARD 17)

# ✅ Include ALL cpp files recursively
file(GLOB_RECURSE SRC_FILES
    src/*.cpp
)

# ✅ Add executable
add_executable(exchange ${SRC_FILES})

# ✅ VERY IMPORTANT: Tell compiler where headers are
target_include_directories(exchange PRIVATE
    ${PROJECT_SOURCE_DIR}/src
)