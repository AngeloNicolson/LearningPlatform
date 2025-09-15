# Makefile for Debate Platform

# Emscripten settings
EMCC = emcc
EMFLAGS = -O3 -s WASM=1 -s EXPORTED_RUNTIME_METHODS=["ccall","cwrap"] --bind -s ALLOW_MEMORY_GROWTH=1 -s NO_EXIT_RUNTIME=1

# Directories
SRC_DIR = src/cpp
BUILD_DIR = public
WEB_DIR = src/web

# Source files
CPP_SOURCES = $(SRC_DIR)/core.cpp $(SRC_DIR)/wasm_bindings.cpp

# Output files
WASM_OUTPUT = $(BUILD_DIR)/debate_platform.js
HTML_OUTPUT = $(BUILD_DIR)/index.html

# Default target
all: wasm

# Build WASM module
wasm: $(WASM_OUTPUT)

$(WASM_OUTPUT): $(CPP_SOURCES)
	@mkdir -p $(BUILD_DIR)
	$(EMCC) $(CPP_SOURCES) $(EMFLAGS) -o $@

# Clean build artifacts
clean:
	rm -rf $(BUILD_DIR)/*.js $(BUILD_DIR)/*.wasm $(BUILD_DIR)/*.html

# Development server
serve: wasm
	cd $(BUILD_DIR) && python3 -m http.server 8080

# Build with debug info
debug: EMFLAGS += -g -s ASSERTIONS=1 -s SAFE_HEAP=1
debug: wasm

.PHONY: all wasm clean serve debug