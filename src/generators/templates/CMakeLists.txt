cmake_minimum_required(VERSION 3.15)

project("${name}" CXX)

if(EXISTS cps.cmake)
    include(cps.cmake)
endif()

"${find_package}"

"${executables}"
  
"${libraries}"

"${links}"

"${headers}"
                      
"${install}"
