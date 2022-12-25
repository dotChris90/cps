find_program(PIP pip3)

if(PIP)

    set(REQU ${CMAKE_CURRENT_SOURCE_DIR}/requirements.txt)

    if(EXISTS ${REQU})
        exec_program(COMMAND ${PIP} install -r ${REQU})
    else() 
        message( FATAL_ERROR "requirements file missing - please generate it." )
    endif()
    
else()

    message( FATAL_ERROR "pip3 program is missing - please install manually." )

endif(PIP)