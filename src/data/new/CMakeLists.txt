cmake_minimum_required(VERSION 3.15)
project(abc CXX)

add_executable(abc src/abc.cpp src/main.cpp)
target_include_directories(abc PUBLIC include)

install(TARGETS abc)
