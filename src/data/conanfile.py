from conans import tools
from conan import ConanFile
from conan.tools.cmake import CMakeToolchain, CMake, CMakeDeps
from conan.tools.layout import cmake_layout


class CPSTESTConan(ConanFile):

    name = "cpsTest"
    version = "0.1.0"

    # Optional metadata
    license = "MIT"
    author = "null"
    url = "null"
    description = "null"
    topics =  (
    "topic1"
    )

    # Binary configuration
    settings = "os", "compiler", "build_type", "arch"
    options = {}
    options["shared"] = ["true","false"]
    options["fPIC"] = ["true","false"]

    default_options = {}
    default_options["shared"] = "false"
    default_options["fPIC"] = "true"

    # Sources are located in the same place as this recipe, copy them to the recipe
    exports_sources = "CMakeLists.txt", "src/*"

    def config_options(self):
        if self.settings.os == "Windows":
            del self.options.fPIC

    def requirements(self):
        self.requires("fmt/8.1.1")
        
    def build_requirements(self):
        self.tool_requires("doxygen/1.9.4")
        self.tool_requires("cppcheck/2.7.5")
        

    def layout(self):
        cmake_layout(self)

    def generate(self):
        tc = CMakeToolchain(self)
        tc.generate()
        cmake = CMakeDeps(self)
        cmake.generate()

    def build(self):
        cmake = CMake(self)
        cmake.configure()
        cmake.build()

    def package(self):
        cmake = CMake(self)
        cmake.install()

    def package_info(self):
        self.cpp_info.libs = tools.collect_libs(self)

