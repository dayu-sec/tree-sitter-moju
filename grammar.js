/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "moju",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($._item),

    // ── Comments ──────────────────────────────────────────────────
    comment: (_$) =>
      token(choice(seq("//", /.*/), seq("#", /.*/), seq("/*", repeat(choice(/[^*]/, /\*[^/]/)), "*/"))),

    // ── Top-level items ───────────────────────────────────────────
    _item: ($) =>
      choice(
        $.struct_def,
        $.state_def,
        $.event_def,
        $.failure_def,
        $.failure_policy_def,
        $.message_def,
        $.command_def,
        $.actor_def,
        $.lifecycle_def,
        $.capability_def,
        $.flow_def,
        $.verify_def,
        $.layer_def,
        $.dependency_rule_def,
        $.module_def,
        $.decision_def,
        $.interface_def,
        $.storage_def,
        $.config_def,
        $.dataflow_def,
        $.target_def,
        $.binding_def,
      ),

    // ── Struct ────────────────────────────────────────────────────
    struct_def: ($) =>
      seq("struct", field("name", $.identifier), "{", repeat($.field_def), "}"),

    field_def: ($) =>
      seq(optional("unique"), field("name", $.identifier), optional(seq(":", field("type", $.ref)))),

    // ── State ─────────────────────────────────────────────────────
    state_def: ($) =>
      seq("state", field("name", $.identifier), "{", repeat($.state_value), "}"),

    state_value: ($) => field("name", $.identifier),

    // ── Event ─────────────────────────────────────────────────────
    event_def: ($) =>
      seq("event", field("name", $.identifier), "{", repeat($.event_field), "}"),

    event_field: ($) => field("name", $.identifier),

    // ── Failure ───────────────────────────────────────────────────
    failure_def: ($) =>
      seq(
        "failure",
        field("name", $.identifier),
        optional(seq(":", field("parent", $.ref))),
        "{",
        repeat($.failure_stmt),
        "}",
      ),

    failure_stmt: ($) =>
      choice(
        seq("identity", field("identity", $.path)),
        seq("id", field("id", $.path)),
        seq(field("from", $.path), "->", field("to", $.path)),
        seq("description", field("description", $.string)),
        seq("tag", field("tag", $.identifier)),
      ),

    // ── Failure Policy ────────────────────────────────────────────
    failure_policy_def: ($) =>
      seq(
        "failure_policy",
        field("name", $.identifier),
        optional(seq("<", field("view", $.ref), ">")),
        optional(seq(":", field("parent", $.ref))),
        "{",
        repeat($.failure_policy_stmt),
        "}",
      ),

    failure_policy_stmt: ($) =>
      choice($.slot_policy, $.retry_block),

    slot_policy: ($) =>
      seq(
        field("slot", $.identifier),
        ":",
        repeat1($.then_fail_action),
      ),

    then_fail_action: ($) =>
      seq("then", $.fail_action),

    fail_action: ($) =>
      choice(
        seq("emit", field("event", $.ref)),
        "ignore",
        "throw",
      ),

    // ── Message ───────────────────────────────────────────────────
    message_def: ($) =>
      seq(
        "message",
        "<",
        field("role", $.message_role),
        ">",
        field("name", $.identifier),
        "{",
        repeat($.field_def),
        "}",
      ),

    message_role: (_$) => choice("command", "query", "response"),

    // ── Command (legacy) ──────────────────────────────────────────
    command_def: ($) =>
      seq("command", field("name", $.identifier), "{", repeat($.command_field), "}"),

    command_field: ($) => field("name", $.identifier),

    // ── Actor ─────────────────────────────────────────────────────
    actor_def: ($) =>
      seq(
        "actor",
        field("name", $.identifier),
        optional(seq(":", field("parent", $.identifier))),
        "{",
        repeat($.actor_stmt),
        "}",
      ),

    actor_stmt: ($) =>
      choice(
        seq("identity", field("identity", $.identifier)),
        seq("can", field("command", $.identifier)),
        seq("access", field("protocols", $.protocol_binding_list)),
      ),

    protocol_binding_list: ($) =>
      seq($.protocol_binding, repeat(seq(",", $.protocol_binding))),

    // ── Interface ─────────────────────────────────────────────────
    interface_def: ($) =>
      seq("interface", field("name", $.identifier), "{", repeat($.interface_entry), "}"),

    interface_entry: ($) =>
      seq("entry", field("name", $.identifier), "{", repeat($.interface_entry_stmt), "}"),

    interface_entry_stmt: ($) =>
      choice(
        seq("actor", field("actor", $.ref)),
        seq("input", field("input", $.ref)),
        seq("output", field("output", $.ref)),
        seq("calls", field("calls", $.ref)),
      ),

    // ── Storage ───────────────────────────────────────────────────
    storage_def: ($) =>
      seq(
        "storage",
        field("name", $.identifier),
        "<",
        field("kind", $.storage_kind),
        ">",
        "for",
        field("target", $.ref),
        "{",
        repeat($.storage_stmt),
        "}",
      ),

    storage_kind: (_$) =>
      choice(
        "table", "document", "key_value", "queue",
        "object", "search", "graph", "cache",
      ),

    storage_stmt: ($) =>
      seq("durability", field("durability", $.durability_kind)),

    durability_kind: (_$) => choice("transient", "persistent", "derived"),

    // ── Config ────────────────────────────────────────────────────
    config_def: ($) =>
      seq("config", field("name", $.identifier), "for", field("target", $.ref), "{", repeat($.config_stmt), "}"),

    config_stmt: ($) =>
      choice($.config_item, seq("validate", field("validate", $.string))),

    config_item: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("type", $.ref),
        "{",
        repeat($.config_item_stmt),
        "}",
      ),

    config_item_stmt: ($) =>
      choice(
        seq("required", field("required", $.identifier)),
        seq("default", "{", repeat($.setting), "}"),
        seq("validate", field("validate", $.string)),
        $.setting,
      ),

    // ── Dataflow ──────────────────────────────────────────────────
    dataflow_def: ($) =>
      seq("dataflow", field("name", $.identifier), "{", repeat($.dataflow_stmt), "}"),

    dataflow_stmt: ($) =>
      choice($.data_node_stmt, $.data_edge_stmt),

    data_node_stmt: ($) =>
      seq("node", "<", field("kind", $.data_node_kind), ">", field("target", $.ref)),

    data_node_kind: (_$) =>
      choice("message", "struct", "storage", "flow", "cap", "module", "transform", "external"),

    data_edge_stmt: ($) =>
      seq(
        "edge",
        "<",
        field("mode", $.data_edge_mode),
        ">",
        field("from", $.ref),
        "->",
        field("to", $.ref),
        "{",
        repeat($.data_edge_body),
        "}",
      ),

    data_edge_body: ($) =>
      seq("data", field("data", $.path_list)),

    data_edge_mode: (_$) =>
      choice("read", "write", "transform", "call", "emit", "trigger", "publish", "consume"),

    // ── Target ────────────────────────────────────────────────────
    target_def: ($) =>
      seq(
        "target",
        "<",
        field("kind", $.target_kind),
        optional(seq(",", field("protocol", $.protocol_name))),
        ">",
        "{",
        repeat($.setting),
        "}",
      ),

    target_kind: (_$) => choice("bin", "lib", "mod"),

    // ── Binding ───────────────────────────────────────────────────
    binding_def: ($) =>
      choice($.interface_binding, $.storage_binding, $.config_binding),

    interface_binding: ($) =>
      seq(
        "bind",
        field("interface", $.ref),
        optional(seq("by", field("protocol", $.protocol_binding))),
        "{",
        repeat($.interface_binding_entry),
        "}",
      ),

    interface_binding_entry: ($) =>
      seq("entry", field("name", $.identifier), "{", repeat($.interface_binding_stmt), "}"),

    interface_binding_stmt: ($) =>
      choice(
        seq("route", field("method", $.identifier), field("path", $.string)),
        seq("input", field("type", $.ref)),
        seq("output", field("type", $.ref), optional(seq("status", field("status", $.integer)))),
        $.setting,
      ),

    storage_binding: ($) =>
      seq(
        "bind",
        field("storage", $.ref),
        "to",
        field("adapter", $.storage_adapter),
        "{",
        repeat($.storage_binding_stmt),
        "}",
      ),

    storage_adapter: ($) =>
      seq(field("kind", $.storage_adapter_kind), "<", field("target", $.identifier), ">"),

    storage_adapter_kind: (_$) =>
      choice("cache", "sqldb", "document", "key_value", "search", "queue", "object", "graph"),

    storage_binding_stmt: ($) =>
      choice(
        seq("table", field("table", $.identifier)),
        seq("primary_key", field("primary_key", $.identifier)),
        seq("index", field("index", $.identifier)),
        $.setting,
      ),

    config_binding: ($) =>
      seq(
        "bind",
        field("config", $.ref),
        "to",
        field("provider", $.config_provider),
        "{",
        repeat($.config_binding_stmt),
        "}",
      ),

    config_provider: ($) =>
      choice(
        seq("file", "<", field("format", $.config_file_format), ">"),
        "env",
        $.identifier,
      ),

    config_file_format: (_$) => choice("toml", "yaml", "json"),

    config_binding_stmt: ($) =>
      choice($.path_binding, $.content_binding, seq("reload", field("reload", $.identifier)), $.setting),

    path_binding: ($) =>
      seq("path", "{", repeat($.path_binding_stmt), "}"),

    path_binding_stmt: ($) =>
      choice(
        seq("env", field("env", $.identifier)),
        seq("default", field("default", $.string)),
        seq("required", field("required", $.boolean)),
      ),

    content_binding: ($) =>
      seq("content", "{", repeat($.content_binding_stmt), "}"),

    content_binding_stmt: ($) =>
      choice(
        seq("encoding", field("encoding", $.identifier)),
        seq("expand", "<", field("field", $.identifier), ">", field("expand", $.boolean)),
        seq("strict_unknown_fields", field("strict", $.boolean)),
      ),

    // ── Lifecycle ─────────────────────────────────────────────────
    lifecycle_def: ($) =>
      seq(
        "lifecycle",
        field("name", $.identifier),
        "for",
        field("target", $.path),
        "{",
        repeat($.lifecycle_stmt),
        "}",
      ),

    lifecycle_stmt: ($) =>
      choice(
        seq("initial", field("state", $.identifier)),
        $.transition_stmt,
        $.forbid_stmt,
      ),

    transition_stmt: ($) =>
      seq(
        "transition",
        field("from", $.identifier),
        "->",
        field("to", $.identifier),
        "on",
        field("event", $.ref),
      ),

    forbid_stmt: ($) =>
      seq("forbid", field("from", $.identifier), "->", field("to", $.identifier)),

    // ── Capability ────────────────────────────────────────────────
    capability_def: ($) =>
      seq("cap", field("name", $.identifier), "{", repeat($.operation_def), "}"),

    operation_def: ($) =>
      seq(
        optional("async"),
        "op",
        field("name", $.identifier),
        "{",
        repeat($.operation_stmt),
        "}",
      ),

    operation_stmt: ($) =>
      choice(
        seq("input", field("input", $.path)),
        seq("ack", field("event", $.ref)),
        seq("result", field("event", $.ref)),
      ),

    // ── Flow ──────────────────────────────────────────────────────
    flow_def: ($) =>
      seq("flow", field("name", $.identifier), "{", repeat($.flow_stmt), "}"),

    flow_stmt: ($) =>
      choice(
        seq("actor", field("actor", $.ref)),
        seq("trigger", field("trigger", $.ref)),
        seq("depends", field("depends", $.ref_list)),
        seq("creates", field("creates", $.ref_list)),
        $.require_block,
        $.step_def,
        $.ensure_block,
      ),

    require_block: ($) => seq("require", "{", repeat($.condition), "}"),

    ensure_block: ($) => seq("ensure", "{", repeat($.condition), "}"),

    step_def: ($) =>
      seq("step", field("name", $.identifier), "{", repeat($.step_stmt), "}"),

    step_stmt: ($) =>
      choice($.event_guard, $.call_stmt, $.create_stmt, $.emit_stmt, $.on_block, $.ensure_block),

    event_guard: ($) => seq("on", field("event", $.ref)),

    call_stmt: ($) =>
      seq("call", optional("async"), field("operation", $.op_path), optional($.with_block)),

    with_block: ($) => seq("with", "{", repeat($.call_policy_stmt), "}"),

    call_policy_stmt: ($) =>
      choice($.retry_block, $.timeout_policy, $.use_policy),

    retry_block: ($) => seq("retry", "{", repeat($.retry_stmt), "}"),

    retry_stmt: ($) => choice(seq("max", field("max", $.integer)), seq("backoff", field("backoff", $.identifier))),

    timeout_policy: ($) => seq("timeout", field("timeout", $.duration), "->", field("event", $.ref)),

    use_policy: ($) => seq("use", field("policy", $.ref)),

    create_stmt: ($) =>
      seq("create", field("target", $.ref), "{", repeat($.assignment), "}"),

    emit_stmt: ($) =>
      seq("emit", field("event", $.ref), "{", repeat($.assignment), "}"),

    on_block: ($) => seq("on", field("event", $.ref), "{", repeat($.action_stmt), "}"),

    action_stmt: ($) =>
      choice($.change_stmt, $.goto_stmt, $.create_stmt, $.emit_stmt, $.call_stmt, $.ensure_block),

    change_stmt: ($) => seq("change", field("target", $.path), "+=", field("value", $.expr)),

    goto_stmt: ($) => seq("goto", field("step", $.identifier)),

    // ── Verify ────────────────────────────────────────────────────
    verify_def: ($) =>
      seq(
        "verify",
        field("name", $.identifier),
        "for",
        "flow",
        field("flow", $.ref),
        "{",
        repeat($.verify_stmt),
        "}",
      ),

    verify_stmt: ($) =>
      choice($.given_block, $.mock_stmt, $.when_stmt, $.expect_block, $.ensure_no_violation_stmt),

    given_block: ($) => seq("given", "{", repeat($.given_stmt), "}"),

    given_stmt: ($) => seq(field("target", $.path), $.assign_op, field("value", $.expr)),

    assign_op: (_$) => choice("=", ">="),

    mock_stmt: ($) =>
      seq("mock", field("operation", $.op_path), "->", $.mock_outcome, optional($.mock_body)),

    mock_outcome: ($) =>
      choice($.ref, "timeout", seq("failure", field("failure", $.ref))),

    mock_body: ($) => seq("{", repeat($.assignment), "}"),

    when_stmt: ($) => seq("when", field("command", $.ref)),

    expect_block: ($) => seq("expect", "{", repeat($.condition), "}"),

    ensure_no_violation_stmt: ($) => seq("ensure_no_violation", field("kind", $.identifier)),

    // ── Architecture ──────────────────────────────────────────────
    layer_def: ($) => seq("layer", field("name", $.identifier)),

    dependency_rule_def: ($) =>
      seq("dependency_rule", field("name", $.identifier), "{", repeat($.dependency_edge), "}"),

    dependency_edge: ($) =>
      seq(field("from", $.identifier), "->", field("to", choice($.identifier, "none_external"))),

    module_def: ($) =>
      seq("module", field("name", $.identifier), "{", repeat($.module_stmt), "}"),

    module_stmt: ($) =>
      choice(
        seq("layer", field("layer", $.identifier)),
        seq("owns", field("items", $.ref_list)),
        seq("depends", field("items", $.ref_list)),
        seq("uses", field("items", $.ref_list)),
        seq("implements", field("caps", $.ref_list)),
        seq("provides", field("interface", $.ref), "by", field("protocol", $.protocol_binding)),
        seq("responsible_for", field("responsible", $.string)),
        seq("not_responsible_for", field("not_responsible", $.string)),
      ),

    // ── Decisions ─────────────────────────────────────────────────
    decision_def: ($) =>
      seq("decision", field("name", $.identifier), "{", repeat($.decision_stmt), "}"),

    decision_stmt: ($) =>
      choice(
        seq("title", field("title", $.string)),
        seq("context", field("context", $.string)),
        seq("choose", field("choose", $.string)),
        $.reject_stmt,
        seq("accept_tradeoff", field("accept", $.string)),
        seq("mitigate", field("mitigate", $.string)),
        seq("revisit_when", field("revisit", $.string)),
      ),

    reject_stmt: ($) =>
      seq("reject", field("reject", $.string), "because", field("because", $.string)),

    // ── Expressions and conditions ────────────────────────────────
    condition: ($) =>
      choice(
        $.not_created_condition,
        $.includes_condition,
        $.in_condition,
        $.compare_condition,
        $.bool_path_condition,
      ),

    bool_path_condition: ($) => $.path,

    compare_condition: ($) => seq($.expr, $.compare_op, $.expr),

    compare_op: (_$) => choice("==", ">", ">="),

    includes_condition: ($) => seq($.path, "includes", $.expr),

    in_condition: ($) => seq($.path, "in", "[", $.identifier_list, "]"),

    not_created_condition: ($) => seq($.identifier, "not_created"),

    assignment: ($) => seq(field("name", $.identifier), "=", field("value", $.expr)),

    expr: ($) => choice($.literal, $.path),

    literal: ($) => choice($.string, $.integer, $.boolean),

    // ── Settings and values ───────────────────────────────────────
    setting: ($) => seq(field("key", $.identifier), field("value", $.value)),

    value: ($) =>
      choice($.config_field_ref, $.duration, $.path, $.string, $.integer),

    config_field_ref: ($) => seq("config", field("config", $.identifier), ".", field("field", $.identifier)),

    // ── Protocol ──────────────────────────────────────────────────
    protocol_binding: ($) =>
      seq("protocol", "<", field("protocol", $.protocol_name), ">"),

    protocol_name: (_$) => choice("http", "grpc", "cli", "queue", "call"),

    // ── Shared atoms ──────────────────────────────────────────────
    ref_list: ($) => seq($.ref, repeat(seq(",", $.ref))),

    path_list: ($) => seq($.path, repeat(seq(",", $.path))),

    identifier_list: ($) => seq($.identifier, repeat(seq(",", $.identifier))),

    ref: ($) => $.path,

    op_path: ($) => $.path,

    path: ($) => seq($.identifier, repeat(seq(".", $.identifier))),

    duration: (_$) => token(/[0-9]+(ms|s|m)/),

    string: (_$) => token(seq('"', repeat(choice(/[^"\\]/, /\\./)), '"')),

    integer: (_$) => token(/[0-9]+/),

    boolean: (_$) => choice("true", "false"),

    identifier: (_$) => /[A-Za-z_][A-Za-z0-9_]*/,
  },
});
