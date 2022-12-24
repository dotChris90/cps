cmake_minimum_required(VERSION 3.15)
project(abc CXX)

add_library(abc src/abc.cpp)
target_include_directories(abc PUBLIC include)

set_target_properties(abc PROPERTIES PUBLIC_HEADER "include/abc.h")
install(TARGETS abc)
