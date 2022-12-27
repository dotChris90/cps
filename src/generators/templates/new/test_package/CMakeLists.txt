
cmake_minimum_required(VERSION 3.1)
project("${name}"_test CXX)

find_package(GTest REQUIRED)
find_package("${name}" CONFIG REQUIRED)

enable_testing()

add_executable(pkg_test main.cpp 
                        Greeter_test.cpp
)
target_link_libraries(pkg_test  "${name}"::"${name}" 
                                GTest::GTest
)

include(GoogleTest)

gtest_discover_tests(pkg_test)
