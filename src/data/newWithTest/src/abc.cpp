#include <iostream>
#include "abc.h"

void abc(){
    #ifdef NDEBUG
    std::cout << "abc/1.2.3: Hello World Release!\n";
    #else
    std::cout << "abc/1.2.3: Hello World Debug!\n";
    #endif

    // ARCHITECTURES
    #ifdef _M_X64
    std::cout << "  abc/1.2.3: _M_X64 defined\n";
    #endif

    #ifdef _M_IX86
    std::cout << "  abc/1.2.3: _M_IX86 defined\n";
    #endif

    #ifdef _M_ARM64
    std::cout << "  abc/1.2.3: _M_ARM64 defined\n";
    #endif

    #if __i386__
    std::cout << "  abc/1.2.3: __i386__ defined\n";
    #endif

    #if __x86_64__
    std::cout << "  abc/1.2.3: __x86_64__ defined\n";
    #endif

    #if __aarch64__
    std::cout << "  abc/1.2.3: __aarch64__ defined\n";
    #endif

    // Libstdc++
    #if defined _GLIBCXX_USE_CXX11_ABI
    std::cout << "  abc/1.2.3: _GLIBCXX_USE_CXX11_ABI "<< _GLIBCXX_USE_CXX11_ABI << "\n";
    #endif

    // COMPILER VERSIONS
    #if _MSC_VER
    std::cout << "  abc/1.2.3: _MSC_VER" << _MSC_VER<< "\n";
    #endif

    #if _MSVC_LANG
    std::cout << "  abc/1.2.3: _MSVC_LANG" << _MSVC_LANG<< "\n";
    #endif

    #if __cplusplus
    std::cout << "  abc/1.2.3: __cplusplus" << __cplusplus<< "\n";
    #endif

    #if __INTEL_COMPILER
    std::cout << "  abc/1.2.3: __INTEL_COMPILER" << __INTEL_COMPILER<< "\n";
    #endif

    #if __GNUC__
    std::cout << "  abc/1.2.3: __GNUC__" << __GNUC__<< "\n";
    #endif

    #if __GNUC_MINOR__
    std::cout << "  abc/1.2.3: __GNUC_MINOR__" << __GNUC_MINOR__<< "\n";
    #endif

    #if __clang_major__
    std::cout << "  abc/1.2.3: __clang_major__" << __clang_major__<< "\n";
    #endif

    #if __clang_minor__
    std::cout << "  abc/1.2.3: __clang_minor__" << __clang_minor__<< "\n";
    #endif

    #if __apple_build_version__
    std::cout << "  abc/1.2.3: __apple_build_version__" << __apple_build_version__<< "\n";
    #endif

    // SUBSYSTEMS

    #if __MSYS__
    std::cout << "  abc/1.2.3: __MSYS__" << __MSYS__<< "\n";
    #endif

    #if __MINGW32__
    std::cout << "  abc/1.2.3: __MINGW32__" << __MINGW32__<< "\n";
    #endif

    #if __MINGW64__
    std::cout << "  abc/1.2.3: __MINGW64__" << __MINGW64__<< "\n";
    #endif

    #if __CYGWIN__
    std::cout << "  abc/1.2.3: __CYGWIN__" << __CYGWIN__<< "\n";
    #endif
}
