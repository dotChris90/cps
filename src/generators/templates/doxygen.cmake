find_program(DOXYGEN doxygen)

if(DOXYGEN)

    set(DOXYFILE ${CMAKE_CURRENT_SOURCE_DIR}/Doxyfile)

    add_custom_target( doxy
        COMMAND ${DOXYGEN} ${DOXYFILE}
        WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
        COMMENT "Generating API documentation with Doxygen"
        VERBATIM )
else()
    # pass 
endif(DOXYGEN)
