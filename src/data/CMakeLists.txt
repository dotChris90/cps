cmake_minimum_required(VERSION 3.15)

project(cpsTest CXX)

include(cps.cmake)

find_package(fmt REQUIRED)


add_executable(cpsTest::main
               "src/main.cpp"
)

  
add_library(cpsTest::Hello
               "src/Greeter.cpp"
)


target_link_libraries(cpsTest::main cpsTest::Hello)
target_link_libraries(cpsTest::Hello fmt::fmt)


set_target_properties(cpsTest::Hello PROPERTIES PUBLIC_HEADER 
                      "src/Greeter.hpp"
)

                      
install(TARGETS cpsTest::main cpsTest::Hello DESTINATION "."
        PUBLIC_HEADER DESTINATION include
        RUNTIME DESTINATION bin
        ARCHIVE DESTINATION lib
        LIBRARY DESTINATION lib
)

