cmake_minimum_required(VERSION 3.15)

project(abc CXX)

if(EXISTS ${CMAKE_SOURCE_DIR}/cps.cmake)
    include(${CMAKE_SOURCE_DIR}/cps.cmake)
endif()

find_package(fmt REQUIRED)


add_executable(main
               "src/main.cpp"
)

  
add_library(Hello
               "src/Greeter.cpp"
)


target_link_libraries(main Hello)
target_link_libraries(Hello fmt::fmt)


set_target_properties(Hello PROPERTIES PUBLIC_HEADER 
                      "src/Greeter.hpp"
)

                      
install(TARGETS main Hello DESTINATION "."
        PUBLIC_HEADER DESTINATION include
        RUNTIME DESTINATION bin
        ARCHIVE DESTINATION lib
        LIBRARY DESTINATION lib
)

