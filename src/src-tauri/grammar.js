/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "src_tauri",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
