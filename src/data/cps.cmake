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
find_program(CPPCHECK cppcheck)

if(CPPCHECK)
    set(CMAKE_CXX_CPPCHECK ${CPPCHECK})
    list(APPEND CMAKE_CXX_CPPCHECK "--enable=all" "--error-exitcode=10")
else()
    # pass 
endif(CPPCHECK)
find_program(METRIXPP metrix++)

if(METRIXPP)
    file(STRINGS "${CMAKE_CURRENT_SOURCE_DIR}/metrixpp.config" metrixconfig)
    string(REPLACE "--" " --" metrixconfig "${metrixconfig}")
    string(REPLACE ";" "" metrixconfig "${metrixconfig}")
    
    set(SRC_DIR "src")
    set(METRIX_ARGS  --std.code.complexity.cyclomatic 
                     --std.code.complexity.maxindent 
                     --std.code.filelines.code 
                     --std.code.filelines.preprocessor 
                     --std.code.filelines.comments 
                     --std.code.filelines.total 
                     --std.code.length.total 
                     --std.code.lines.code 
                     --std.code.lines.preprocessor 
                     --std.code.lines.comments 
                     --std.code.lines.total 
                     --std.code.longlines 
                     --std.code.magic.numbers 
                     --std.code.magic.numbers.simplier 
                     --std.code.member.fields 
                     --std.code.member.globals 
                     --std.code.member.classes 
                     --std.code.member.structs 
                     --std.code.member.interfaces 
                     --std.code.member.types 
                     --std.code.member.methods 
                     --std.code.member.namespaces 
                     --std.code.maintindex.simple 
                     --std.code.todo.comments 
                     --std.code.todo.strings 
                     --std.general.proctime 
                     --std.general.procerrors 
                     --std.general.size)
    set(METRIX_DB ${CMAKE_CURRENT_BINARY_DIR}/metrixpp.db)
    set(METRIX_VIEW ${CMAKE_CURRENT_BINARY_DIR}/view.txt)
                     
    add_custom_target("metrixpp"
                       DEPENDS ${METRIX_VIEW})
    add_custom_command(OUTPUT ${METRIX_VIEW}
                       COMMAND ${METRIXPP}
                        ARGS collect --db-file=${METRIX_DB} --log-level=ERROR ${METRIX_ARGS} ${SRC_DIR}
                        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
                       COMMAND ${METRIXPP}
                        ARGS view --db-file=${METRIX_DB} > ${METRIX_VIEW}
                        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}

    )
else() 
    # pass
endif(METRIXPP)
