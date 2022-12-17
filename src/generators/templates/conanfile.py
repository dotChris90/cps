from conans import tools
from conan.tools.cmake import CMakeToolchain, CMake, CMakeDeps
from conan.tools.layout import cmake_layout


class {{package_name}}Conan(ConanFile):

    name = "{{ name }}"
    version = "{{ version }}"

    # Optional metadata
    license = "{{license}}"
    author = "{{author}}"
    url = "{{url}}"
    description = "{{description}}"
    topics = {{topics}}

    # Binary configuration
    settings = "os", "compiler", "build_type", "arch"
    {{package_option}}
    {{default_option}}
    # Sources are located in the same place as this recipe, copy them to the recipe
    exports_sources = "CMakeLists.txt", "src/*"

    {{config_options}}
    {{requirements}}
    {{build_requirements}}

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

