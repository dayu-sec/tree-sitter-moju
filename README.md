# tree-sitter-moju

Tree-sitter grammar for **MoJu**, a design language for modeling software structure, state lifecycles, flows, architecture boundaries, verification scenarios, and design decisions.

## Language Scope

This grammar targets `.mju` files and follows the current MoJu EBNF in `moju/docs-zh/grammar-ebnf.md`.

It covers:

- concepts: `struct`, `state`, `event`, `error`, `command`, `actor`
- behavior: `lifecycle`, `flow`, `step`, `call`, `create`, `emit`, `on`
- verification: `verify`, `given`, `mock`, `when`, `expect`
- architecture: `layer`, `dependency_rule`, `module`, `depends`, `implements`
- decisions: `decision`

## Development

```sh
tree-sitter generate
tree-sitter parse examples/order-system.mju
tree-sitter test
cargo test
```

## Rust Usage

```rust
let mut parser = tree_sitter::Parser::new();
parser.set_language(&tree_sitter_moju::language()).unwrap();
let tree = parser.parse("struct Order { unique id }", None).unwrap();
println!("{}", tree.root_node().to_sexp());
```
