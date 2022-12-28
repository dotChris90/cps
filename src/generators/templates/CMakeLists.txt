cmake_minimum_required(VERSION 3.15)

project("${name}" CXX)

if(EXISTS ${CMAKE_SOURCE_DIR}/cps.cmake)
    include(${CMAKE_SOURCE_DIR}/cps.cmake)
endif()

"${find_package}"

"${executables}"
  
"${libraries}"

"${links}"

"${headers}"
                      
"${install}"
