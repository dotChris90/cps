find_program(CPPCHECK cppcheck)

if(CPPCHECK)
    set(CMAKE_CXX_CPPCHECK ${CPPCHECK})
    list(APPEND CMAKE_CXX_CPPCHECK "--enable=all" "--error-exitcode=10")
else()
    # pass 
endif(CPPCHECK)