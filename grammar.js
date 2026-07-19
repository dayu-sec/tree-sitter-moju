/// <reference types="tree-sitter-cli/dsl" />

const commaSep1 = (rule) => seq(rule, repeat(seq(",", rule)));
const angle = (rule) => seq("<", rule, ">");
const arrow = ($) => choice("->", "→");

module.exports = grammar({
  name: "moju",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.storage_binding, $.config_binding, $.binding_source],
    [$.bare_config_value, $.config_field_ref],
  ],

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
        $.variant_def,
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
        $.usecase_def,
        $.scenario_def,
        $.subsystem_def,
        $.layer_def,
        $.dependency_rule_def,
        $.module_def,
        $.decision_def,
        $.interface_def,
        $.storage_def,
        $.config_def,
        $.dataflow_def,
        $.target_def,
        $.simple_binding,
        $.binding_def,
        $.region_def,
        $.view_impl_def,
        $.retry_policy_def,
        $.node_def,
        $.resource_def,
        $.network_def,
        $.link_def,
        $.assembly_def,
        $.profile_def,
      ),

    // ── Meta ──────────────────────────────────────────────────────
    meta_block: ($) => seq("meta", "{", repeat($.meta_stmt), "}"),

    meta_stmt: ($) =>
      choice(
        seq("label", field("locale", $.locale), field("value", $.text)),
        seq("summary", field("locale", $.locale), field("value", $.text)),
        seq("description", field("locale", $.locale), field("value", $.text)),
        seq("alias", field("locale", $.locale), field("value", $.text)),
        seq("tag", field("tag", $.text)),
        $.setting,
      ),

    // ── Usecase ───────────────────────────────────────────────────
    usecase_def: ($) =>
      seq("usecase", field("name", $.identifier), "{", repeat($.usecase_stmt), "}"),

    usecase_stmt: ($) =>
      choice(
        $.meta_block,
        seq("actor", field("actor", $.ref)),
        seq("trigger", field("trigger", $.ref)),
        seq("outcome", field("outcome", $.ref)),
        seq("flow", field("flow", $.ref)),
        seq("scenario", field("scenario", $.ref)),
        seq("verify", field("verify", $.ref)),
        $.usecase_variant_def,
        $.usecase_failure_def,
      ),

    usecase_variant_def: ($) =>
      seq("variant", field("name", $.identifier), "{", repeat($.usecase_variant_stmt), "}"),

    usecase_failure_def: ($) =>
      seq("failure", field("name", $.identifier), "{", repeat($.usecase_variant_stmt), "}"),

    usecase_variant_stmt: ($) =>
      choice(seq("when", field("predicate", $.predicate_call)), seq("outcome", field("outcome", $.ref)), $.meta_block),

    // ── Subsystem ─────────────────────────────────────────────────
    subsystem_def: ($) =>
      seq(
        "subsystem",
        optional(angle(field("kind", $.identifier))),
        field("name", $.identifier),
        "{",
        repeat($.subsystem_stmt),
        "}",
      ),

    subsystem_stmt: ($) =>
      choice($.meta_block, seq("uses", "module", field("modules", $.ref_list)), seq("uses", field("items", $.ref_list)), $.setting),

    // ── Struct ────────────────────────────────────────────────────
    struct_def: ($) =>
      seq(
        "struct",
        optional(angle(field("params", $.identifier_list))),
        field("name", $.identifier),
        optional($.implements_clause),
        "{",
        repeat($.struct_body),
        "}",
      ),

    implements_clause: ($) => seq("implements", field("caps", $.ref_list)),

    struct_body: ($) => choice($.meta_block, $.struct_op_def, $.send_stmt, $.field_def),

    field_def: ($) =>
      seq(optional("unique"), field("name", $.identifier), optional(seq(":", field("type", $.ref)))),

    struct_op_def: ($) =>
      seq(
        "op",
        optional(angle(field("strategy", $.op_strategy))),
        field("name", $.ref),
        optional(seq("(", optional($.identifier_list), ")")),
        optional(";"),
      ),

    send_stmt: ($) =>
      seq(
        "send",
        optional(angle(field("mode", $.send_mode))),
        field("event", $.ref),
        arrow($),
        field("target", $.ref),
        optional(seq("{", repeat($.assignment), "}")),
      ),

    send_mode: (_$) => choice("sync", "async"),

    op_strategy: (_$) => choice("sync", "async"),

    // ── State ─────────────────────────────────────────────────────
    state_def: ($) => seq("state", optional(angle(field("kind", $.identifier))), field("name", $.identifier), "{", repeat($.state_value), "}"),

    state_value: ($) => field("name", $.identifier),

    variant_def: ($) =>
      seq("variant", optional(angle(field("kind", $.identifier))), field("name", $.identifier), "{", repeat($.variant_case), "}"),

    variant_case: ($) => seq(field("name", $.identifier), optional(seq("{", repeat($.variant_field), "}"))),

    variant_field: ($) => seq($.field_def, optional(",")),

    // ── Event ─────────────────────────────────────────────────────
    event_def: ($) => seq("event", field("name", $.identifier), "{", repeat(choice($.meta_block, $.event_field)), "}"),

    event_field: ($) => seq(field("name", $.identifier), optional(seq(":", field("type", $.ref)))),

    // ── Scenario ──────────────────────────────────────────────────
    scenario_def: ($) => seq("scenario", field("name", $.identifier), "{", repeat($.scenario_stmt), "}"),

    scenario_stmt: ($) =>
      choice(
        $.meta_block,
        seq("participant", field("participant", $.ref)),
        $.scenario_send_stmt,
        $.scenario_alt_block,
      ),

    scenario_send_stmt: ($) =>
      seq(
        field("sender", $.ref),
        "send",
        optional(angle(field("mode", $.send_mode))),
        field("event", $.ref),
        arrow($),
        field("receiver", $.ref),
      ),

    scenario_alt_block: ($) =>
      seq(
        "alt",
        field("name", $.identifier),
        optional(seq("when", field("predicate", $.predicate_call))),
        "{",
        repeat($.scenario_stmt),
        "}",
      ),

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
        seq("id", field("id", choice($.path, $.integer))),
        seq(field("from", $.path), arrow($), field("to", $.path)),
        seq("description", field("description", $.text)),
        seq("tag", field("tag", $.identifier)),
        $.meta_block,
      ),

    // ── Failure Policy ────────────────────────────────────────────
    failure_policy_def: ($) =>
      seq(
        "failure_policy",
        optional(angle(field("kind", $.identifier))),
        field("name", $.identifier),
        optional(angle(field("view", $.ref))),
        optional(seq(":", field("parent", $.ref))),
        "{",
        repeat($.failure_policy_stmt),
        "}",
      ),

    failure_policy_stmt: ($) => choice($.slot_policy, $.retry_block),

    slot_policy: ($) => seq(field("slot", $.identifier), ":", repeat1($.then_fail_action)),

    then_fail_action: ($) => seq("then", $.fail_action),

    fail_action: ($) => choice(seq("emit", field("event", $.ref)), "ignore", "throw"),

    // ── Message ───────────────────────────────────────────────────
    message_def: ($) =>
      seq(
        "message",
        angle(field("roles", $.message_role_list)),
        field("name", $.identifier),
        optional(seq("=", field("view", $.ref))),
        "{",
        repeat($.field_def),
        "}",
      ),

    message_role_list: ($) => commaSep1($.message_role),

    message_role: (_$) => choice("command", "query", "response", "ui"),

    // ── Command (legacy) ──────────────────────────────────────────
    command_def: ($) => seq("command", field("name", $.identifier), "{", repeat(choice($.meta_block, $.command_field)), "}"),

    command_field: ($) => field("name", $.identifier),

    // ── Actor ─────────────────────────────────────────────────────
    actor_def: ($) =>
      seq(
        "actor",
        optional(angle(field("kind", $.identifier))),
        field("name", $.identifier),
        optional(seq(":", field("parent", $.identifier))),
        "{",
        repeat($.actor_stmt),
        "}",
      ),

    actor_stmt: ($) =>
      choice(
        $.meta_block,
        seq("identity", field("identity", $.identifier)),
        seq("can", field("command", $.ref)),
        seq("access", field("protocols", $.protocol_binding_list)),
        $.setting,
      ),

    protocol_binding_list: ($) => commaSep1($.protocol_binding),

    // ── Interface ─────────────────────────────────────────────────
    interface_def: ($) => seq("interface", optional(angle(field("kind", $.identifier))), field("name", $.identifier), "{", repeat(choice($.meta_block, $.interface_entry)), "}"),

    interface_entry: ($) => seq("entry", field("name", $.identifier), "{", repeat($.interface_entry_stmt), "}"),

    interface_entry_stmt: ($) =>
      choice(
        $.meta_block,
        seq("actor", field("actor", $.ref)),
        seq("input", field("input", $.ref)),
        seq("output", field("output", $.ref)),
        seq("calls", field("calls", $.ref)),
        $.setting,
      ),

    // ── Storage ───────────────────────────────────────────────────
    storage_def: ($) =>
      seq(
        "storage",
        field("name", $.identifier),
        angle(field("kind", $.storage_kind)),
        "for",
        field("target", $.storage_target_list),
        "{",
        repeat($.storage_stmt),
        "}",
      ),

    storage_target_list: ($) => commaSep1($.storage_target),

    storage_target: ($) => choice($.message_storage_selector, $.ref),

    message_storage_selector: ($) => choice(angle("Message"), seq("<", "Message", angle(field("role", $.message_role)), ">")),

    storage_kind: (_$) => choice("table", "document", "key_value", "queue", "object", "search", "graph", "cache"),

    storage_stmt: ($) => choice($.meta_block, seq("durability", field("durability", $.durability_kind)), $.setting),

    durability_kind: (_$) => choice("transient", "persistent", "derived"),

    // ── Config ────────────────────────────────────────────────────
    config_def: ($) =>
      seq("config", field("name", $.identifier), "for", field("target", $.ref), "{", repeat($.config_stmt), "}"),

    config_stmt: ($) => choice($.meta_block, $.config_item, seq("validate", field("validate", choice($.condition, $.text)))),

    config_item: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("type", $.ref),
        choice(seq("{", repeat($.config_item_stmt), "}"), "{}"),
      ),

    config_item_stmt: ($) =>
      choice(seq("required", field("required", $.identifier)), seq("default", "{", repeat($.setting), "}"), seq("validate", field("validate", choice($.condition, $.text))), $.setting),

    // ── Dataflow ──────────────────────────────────────────────────
    dataflow_def: ($) => seq("dataflow", field("name", $.identifier), "{", repeat($.dataflow_stmt), "}"),

    dataflow_stmt: ($) => choice($.meta_block, $.data_node_stmt, $.data_edge_stmt),

    data_node_stmt: ($) =>
      seq("node", angle(field("kind", $.data_node_kind)), field("target", $.ref), optional(seq("{", repeat($.data_node_body), "}"))),

    data_node_body: ($) => choice($.meta_block, $.setting),

    data_node_kind: (_$) =>
      choice("actor", "message", "event", "struct", "storage", "flow", "cap", "module", "transform", "gateway", "external", "resource"),

    data_edge_stmt: ($) =>
      seq(
        "edge",
        angle(field("mode", $.data_edge_mode)),
        field("from", $.ref),
        arrow($),
        field("to", $.ref),
        "{",
        repeat($.data_edge_body),
        "}",
      ),

    data_edge_body: ($) => choice(seq("data", field("data", $.path_list)), $.setting),

    data_edge_mode: (_$) => choice("read", "write", "transform", "call", "return", "emit", "trigger", "publish", "consume"),

    // ── Target ────────────────────────────────────────────────────
    target_def: ($) =>
      seq(
        "target",
        "<",
        field("kind", $.target_kind),
        optional(seq(",", field("surface", $.target_surface))),
        ">",
        optional(field("name", $.name_symbol)),
        "{",
        repeat($.target_stmt),
        "}",
      ),

    target_stmt: ($) => choice(seq("modules", field("modules", $.ref_list)), seq("subsystem", field("subsystem", $.identifier)), $.setting),

    target_kind: (_$) => choice("bin", "lib", "mod", "site", "app", "platform"),

    target_surface: (_$) => choice("http", "grpc", "cli", "queue", "call", "web", "desktop", "mobile"),

    // ── Binding ───────────────────────────────────────────────────
    binding_def: ($) =>
      choice($.interface_binding, $.storage_binding, $.config_binding),

    interface_binding: ($) =>
      seq("bind", field("interface", $.ref), optional(seq("by", field("protocol", $.protocol_binding))), "{", repeat($.interface_binding_entry), "}"),

    interface_binding_entry: ($) => seq("entry", field("name", $.identifier), "{", repeat($.interface_binding_stmt), "}"),

    interface_binding_stmt: ($) =>
      choice(
        seq("route", field("method", $.identifier), field("path", $.text)),
        seq("input", field("type", $.ref)),
        prec(1, seq("output", field("type", $.ref), "status", field("status", $.integer))),
        seq("output", field("type", $.ref)),
        seq("status", field("status_ref", $.ref), field("status", $.integer)),
        $.setting,
      ),

    storage_binding: ($) =>
      seq("bind", field("storage", $.ref), "to", field("adapter", $.storage_adapter), "{", repeat($.storage_binding_stmt), "}"),

    storage_adapter: ($) => seq(field("kind", $.storage_adapter_kind), angle(field("target", $.name_symbol))),

    storage_adapter_kind: (_$) => choice("cache", "sqldb", "document", "key_value", "search", "queue", "object", "graph"),

    storage_binding_stmt: ($) =>
      choice(seq("table", field("table", $.identifier)), seq("primary_key", field("primary_key", $.identifier)), seq("index", field("index", $.identifier)), $.setting),

    config_binding: ($) =>
      seq("bind", field("config", $.ref), "to", field("provider", $.config_provider), "{", repeat($.config_binding_stmt), "}"),

    config_provider: ($) => choice(seq("file", angle(field("format", $.config_file_format))), "env"),

    config_file_format: (_$) => choice("toml", "yaml", "json"),

    config_binding_stmt: ($) => choice($.path_binding, $.content_binding, seq("reload", field("reload", $.identifier)), $.setting),

    path_binding: ($) => seq("path", "{", repeat($.path_binding_stmt), "}"),

    path_binding_stmt: ($) =>
      choice(seq("env", field("env", $.identifier)), seq("default", field("default", $.text)), seq("required", field("required", $.boolean))),

    content_binding: ($) => seq("content", "{", repeat($.content_binding_stmt), "}"),

    content_binding_stmt: ($) =>
      choice(seq("encoding", field("encoding", $.identifier)), seq("expand", angle(field("field", $.identifier)), field("expand", $.boolean)), seq("strict_unknown_fields", field("strict", $.boolean))),

    simple_binding: ($) =>
      prec(2, seq("bind", field("source", $.binding_source), "to", field("target", $.identifier), optional(seq("with", field("view", $.identifier))))),

    // ── Lifecycle ─────────────────────────────────────────────────
    lifecycle_def: ($) =>
      seq("lifecycle", field("name", $.identifier), "for", field("target", $.path), "{", repeat($.lifecycle_stmt), "}"),

    lifecycle_stmt: ($) => choice(seq("initial", field("state", $.identifier)), $.transition_stmt, $.forbid_stmt),

    transition_stmt: ($) => seq("transition", field("from", $.identifier), arrow($), field("to", $.identifier), "on", field("event", $.ref)),

    forbid_stmt: ($) => seq("forbid", field("from", $.identifier), arrow($), field("to", $.identifier)),

    // ── Capability ────────────────────────────────────────────────
    capability_def: ($) => seq("cap", field("name", $.identifier), "{", repeat(choice($.meta_block, $.operation_def)), "}"),

    operation_def: ($) =>
      choice(
        seq(optional("async"), "op", field("name", $.identifier), "{", repeat($.operation_stmt), "}"),
        seq("op", optional(angle(field("strategy", $.op_strategy))), field("name", $.identifier), "{", repeat($.operation_stmt), "}"),
      ),

    operation_stmt: ($) => choice(seq("input", field("input", $.path)), seq("ack", field("event", $.ref)), seq("result", field("event", $.ref)), $.setting),

    // ── Flow ──────────────────────────────────────────────────────
    flow_def: ($) =>
      seq("flow", optional(angle(field("kind", $.identifier))), field("name", $.identifier), optional(seq("when", field("predicate", $.predicate_call))), "{", repeat($.flow_stmt), "}"),

    flow_stmt: ($) =>
      choice(
        $.meta_block,
        seq("actor", field("actor", $.ref)),
        seq("trigger", field("trigger", $.ref)),
        seq("depends", field("depends", $.ref_list)),
        seq("creates", field("creates", $.ref_list)),
        $.require_block,
        $.step_def,
        $.ensure_block,
        $.react_block,
      ),

    require_block: ($) => seq("require", "{", repeat($.condition), "}"),

    ensure_block: ($) => seq("ensure", "{", repeat($.condition), "}"),

    step_def: ($) =>
      seq(
        "step",
        field("name", $.identifier),
        optional(seq(arrow($), field("event", $.ref), optional("?"))),
        "{",
        repeat($.step_stmt),
        "}",
      ),

    step_stmt: ($) => choice($.on_block, $.event_guard, $.call_stmt, $.create_stmt, $.emit_stmt, $.ensure_block, $.match_block),

    event_guard: ($) => seq("on", field("event", $.ref)),

    call_stmt: ($) => seq("call", optional("async"), field("operation", $.op_path), optional("with"), optional($.call_policy_block)),

    call_policy_block: ($) => seq("{", repeat($.call_policy_stmt), "}"),

    call_policy_stmt: ($) => choice($.retry_block, $.timeout_policy, $.use_policy),

    retry_block: ($) => choice(seq("retry", "{", repeat($.retry_stmt), "}"), seq("retry", field("policy", $.identifier))),

    retry_stmt: ($) => choice(seq("max", field("max", $.integer)), $.backoff_stmt),

    backoff_stmt: ($) =>
      seq(
        "backoff",
        field("strategy", $.backoff_strategy),
        optional(seq("from", field("from", $.duration))),
        optional(choice(seq("step", field("step", $.duration)), seq("factor", field("factor", $.integer)))),
      ),

    backoff_strategy: (_$) => choice("constant", "linear", "exponential"),

    timeout_policy: ($) => seq("timeout", field("timeout", $.duration), arrow($), field("event", $.ref)),

    use_policy: ($) => seq("use", field("policy", $.ref)),

    create_stmt: ($) => seq("create", field("target", $.ref), "{", repeat($.assignment), "}"),

    emit_stmt: ($) => seq("emit", field("event", $.ref), "{", repeat($.assignment), "}"),

    on_block: ($) => seq("on", field("event", $.ref), optional(seq("when", field("condition", $.condition))), "{", repeat($.action_stmt), "}"),

    action_stmt: ($) => choice($.change_stmt, $.goto_stmt, $.create_stmt, $.emit_stmt, $.call_stmt, $.ensure_block, $.match_block),

    change_stmt: ($) => seq("change", field("target", $.path), "+=", field("value", $.expr)),

    goto_stmt: ($) => seq("goto", field("step", $.identifier)),

    match_block: ($) => seq("match", "{", repeat($.match_arm), "}"),

    match_arm: ($) => seq(choice(field("predicate", $.predicate_call), "_"), arrow($), field("target", $.ref)),

    react_block: ($) =>
      seq("react", angle(field("strategy", $.react_strategy)), field("event", $.ref), "{", repeat($.step_def), "}"),

    react_strategy: (_$) => choice("sync", "async"),

    retry_policy_def: ($) => seq("retry_policy", field("name", $.identifier), "{", repeat($.retry_stmt), "}"),

    // ── Verify ────────────────────────────────────────────────────
    verify_def: ($) =>
      seq("verify", field("name", $.identifier), "for", "flow", field("flow", $.ref), "{", repeat($.verify_stmt), "}"),

    verify_stmt: ($) => choice($.given_block, $.given_inline, $.mock_stmt, $.when_stmt, $.expect_block, $.expect_inline, $.ensure_no_violation_stmt),

    given_block: ($) => seq("given", "{", repeat($.given_stmt), "}"),

    given_inline: ($) => seq("given", $.given_stmt),

    given_stmt: ($) => seq(field("target", $.path), $.assign_op, field("value", $.expr)),

    assign_op: (_$) => choice("=", ">="),

    mock_stmt: ($) => seq("mock", field("operation", $.op_path), arrow($), $.mock_outcome, optional($.mock_body)),

    mock_outcome: ($) => choice($.ref, "timeout", seq("failure", field("failure", $.ref))),

    mock_body: ($) => seq("{", repeat($.assignment), "}"),

    when_stmt: ($) => seq("when", field("command", $.ref)),

    expect_block: ($) => seq("expect", "{", repeat($.condition), "}"),

    expect_inline: ($) => seq("expect", $.condition),

    ensure_no_violation_stmt: ($) => seq("ensure_no_violation", field("kind", $.identifier)),

    // ── Architecture ──────────────────────────────────────────────
    layer_def: ($) => seq("layer", field("name", $.identifier)),

    dependency_rule_def: ($) => seq("dependency_rule", field("name", $.identifier), "{", repeat($.dependency_edge), "}"),

    dependency_edge: ($) => seq(field("from", $.ref), arrow($), field("to", choice($.ref, "none_external"))),

    module_def: ($) =>
      seq(
        "module",
        optional(angle(field("kind", $.identifier))),
        field("name", $.identifier),
        "{",
        repeat($.module_stmt),
        "}",
      ),

    module_stmt: ($) =>
      choice(
        $.meta_block,
        seq("layer", field("layer", $.identifier)),
        seq("owns", field("items", $.ref_list)),
        seq("contains", field("items", $.ref_list)),
        seq("depends", field("items", $.ref_list)),
        seq("uses", field("items", $.ref_list)),
        seq("implements", field("caps", $.ref_list)),
        seq("provides", field("interface", $.ref), "by", field("protocol", $.protocol_binding)),
        seq("responsible_for", field("responsible", $.text)),
        seq("not_responsible_for", field("not_responsible", $.text)),
        $.setting,
      ),

    // ── Decisions ─────────────────────────────────────────────────
    decision_def: ($) => seq("decision", field("name", $.identifier), "{", repeat($.decision_stmt), "}"),

    decision_stmt: ($) =>
      choice(
        $.meta_block,
        seq("title", field("title", $.text)),
        seq("context", field("context", $.text)),
        seq("choose", field("choose", $.text)),
        $.reject_stmt,
        seq("accept_tradeoff", field("accept", $.text)),
        seq("mitigate", field("mitigate", $.text)),
        seq("revisit_when", field("revisit", $.text)),
      ),

    reject_stmt: ($) => seq("reject", field("reject", $.text), "because", field("because", $.text)),

    // ── Region/layout ─────────────────────────────────────────────
    region_def: ($) =>
      seq("region", optional(angle(field("kind", $.region_kind))), field("name", $.identifier), "{", repeat($.region_stmt), "}"),

    region_kind: (_$) => choice("page", "window", "section", "panel", "area"),

    region_stmt: ($) =>
      choice(
        $.meta_block,
        seq("orientation", field("orientation", $.orientation_kind)),
        $.region_contains_stmt,
        seq("when", field("condition", choice($.condition, $.text))),
        seq("layout", field("layout", $.layout_kind)),
        seq("on", field("interaction", $.interaction_kind), optional(field("modifier", $.identifier)), "emit", field("event", $.identifier)),
        $.repeat_stmt,
        $.setting,
      ),

    orientation_kind: (_$) => choice("vertical", "horizontal", "grid"),

    layout_kind: (_$) => choice("scrollable", "fill_remaining", "keyboard_aware", "fixed_bottom"),

    interaction_kind: (_$) => choice("select", "activate", "toggle", "options", "scroll", "reorder", "adjust", "remove", "edit", "zoom"),

    repeat_stmt: ($) =>
      seq(
        "repeat",
        field("item_region", $.identifier),
        "for",
        field("item", $.identifier),
        "in",
        field("data", $.path),
        optional(seq("separator", $.separator_def)),
      ),

    separator_def: ($) =>
      choice(
        seq("{", repeat($.separator_block_stmt), "}"),
        prec(1, seq(field("separator", choice($.text, $.name_symbol)), "when", field("condition", choice($.condition, $.text)))),
        field("separator", choice($.text, $.name_symbol)),
      ),

    separator_block_stmt: ($) => seq("separator", field("separator", $.name_symbol), optional(seq("when", field("condition", choice($.condition, $.text))))),

    view_impl_def: ($) => seq("impl", field("impl", $.ref), "for", field("region", $.identifier)),

    region_contains_stmt: ($) =>
      seq(
        "contains",
        field("region", $.identifier),
        optional(seq("{", repeat($.object_property), "}")),
        repeat(seq(",", field("region", $.identifier))),
      ),

    object_property: ($) => seq(field("key", $.identifier), ":", field("value", $.value_atom), optional(",")),

    // ── Topology ──────────────────────────────────────────────────
    node_def: ($) => seq("node", field("name", $.identifier), optional(seq("{", repeat($.node_stmt), "}"))),

    node_stmt: ($) => choice($.meta_block, $.setting),

    resource_def: ($) => seq("resource", field("name", $.identifier), "{", repeat($.resource_stmt), "}"),

    resource_stmt: ($) => choice($.meta_block, seq("kind", field("kind", $.resource_kind)), $.setting),

    resource_kind: ($) => choice($.storage_adapter, seq("saas", angle(field("target", $.identifier)))),

    network_def: ($) => seq("network", field("name", $.identifier), "{", repeat($.network_stmt), "}"),

    network_stmt: ($) =>
      choice(
        $.meta_block,
        seq("ingress", field("ingress", $.identifier)),
        seq("trust_level", field("trust_level", $.identifier)),
        seq("contains", field("items", $.ref_list)),
        $.setting,
      ),

    link_def: ($) => seq("link", optional(angle(field("kind", $.identifier))), field("from", $.ref), arrow($), field("to", $.ref)),

    // ── Assembly ──────────────────────────────────────────────────
    assembly_def: ($) => seq("assembly", field("name", $.identifier), "{", repeat($.assembly_stmt), "}"),

    assembly_stmt: ($) => choice($.assembly_node_def, $.strategy_def, $.setting),

    assembly_node_def: ($) =>
      seq("node", field("name", $.identifier), optional(seq("for", field("nodes", $.identifier_list))), "{", repeat($.assembly_node_stmt), "}"),

    assembly_node_stmt: ($) => choice($.kind_block, $.scale_block, $.run_block, $.setting),

    kind_block: ($) => seq("kind", field("kind", $.node_kind), "{", repeat($.generic_block_stmt), "}"),

    node_kind: (_$) => choice("host", "docker", "k8s_pod", "k8s_deployment", "cloud_run", "lambda", "wasm"),

    scale_block: ($) => seq("scale", "{", repeat($.generic_block_stmt), "}"),

    run_block: ($) => seq("run", field("runtime", $.name_symbol), "{", repeat($.generic_block_stmt), "}"),

    strategy_def: ($) => seq("strategy", field("name", $.identifier), "{", repeat($.generic_block_stmt), "}"),

    // ── Profile ───────────────────────────────────────────────────
    profile_def: ($) => seq("profile", field("name", $.identifier), "for", field("target", $.ref), "{", repeat($.setting), "}"),

    generic_block_stmt: ($) =>
      choice(
        $.setting,
        seq(field("name", $.identifier), "{", repeat($.generic_block_stmt), "}"),
      ),

    // ── Expressions and conditions ────────────────────────────────
    condition: ($) =>
      choice($.not_created_condition, $.includes_condition, $.in_condition, $.is_condition, $.compare_condition, $.bool_config_condition, $.bool_path_condition),

    bool_path_condition: ($) => $.path,

    bool_config_condition: ($) => $.config_field_ref,

    compare_condition: ($) => seq($.expr, $.compare_op, $.expr),

    compare_op: (_$) => choice("==", "!=", ">", ">=", "<", "<="),

    includes_condition: ($) => seq($.path, "includes", $.expr),

    in_condition: ($) => seq($.path, "in", "[", $.identifier_list, "]"),

    is_condition: ($) => seq($.path, "is", $.identifier),

    not_created_condition: ($) => seq($.identifier, "not_created"),

    predicate_call: ($) =>
      seq(
        field("function", $.predicate_name),
        "(",
        field("path", $.path),
        optional(seq(",", field("value", $.expr))),
        ")",
      ),

    predicate_name: (_$) => choice("not_empty", "equals", "gt", "gte", "lt", "lte", "contains", "matches"),

    assignment: ($) => seq(field("name", $.identifier), "=", field("value", $.expr)),

    expr: ($) => choice($.literal, $.runtime_call, $.config_field_ref, $.path),

    literal: ($) => choice($.text, $.integer, $.boolean),

    runtime_call: ($) => seq(field("function", $.runtime_fn_name), "(", ")"),

    runtime_fn_name: (_$) => choice("now", "empty", "uuid", "node_id"),

    // ── Settings and values ───────────────────────────────────────
    setting: ($) => seq(field("key", $.path), field("value", $.value)),

    value: ($) => commaSep1($.value_atom),

    value_atom: ($) => choice($.adapter_call, $.bare_config_value, $.config_field_ref, $.duration, $.path, $.external_symbol, $.text, $.integer, $.boolean),

    bare_config_value: (_$) => "config",

    adapter_call: ($) => seq(field("adapter", $.identifier), angle(field("target", $.name_symbol))),

    config_field_ref: ($) => seq("config", field("config", $.identifier), ".", field("field", $.identifier)),

    // ── Protocol ──────────────────────────────────────────────────
    protocol_binding: ($) => seq("protocol", angle(field("protocol", $.protocol_name))),

    protocol_name: (_$) => choice("http", "grpc", "cli", "queue", "call"),

    // ── Shared atoms ──────────────────────────────────────────────
    ref_list: ($) => commaSep1($.ref),

    path_list: ($) => commaSep1($.path),

    identifier_list: ($) => commaSep1($.identifier),

    ref: ($) => choice($.scoped_ref, $.generic_ref, $.path),

    scoped_ref: ($) =>
      seq(
        $.path,
        angle(seq(field("kind", $.target_kind), optional(seq(",", field("surface", $.target_surface))))),
      ),

    generic_ref: ($) => seq($.path, angle(field("params", $.ref_list))),

    binding_source: ($) => choice($.ref, $.external_symbol),

    name_symbol: ($) => choice($.identifier, $.external_symbol),

    op_path: ($) => $.path,

    path: ($) => seq($.identifier, repeat(seq(".", $.identifier))),

    duration: (_$) => token(/[0-9]+(ms|s|m)/),

    text: ($) => choice($.string, $.multiline_string),

    string: (_$) => token(seq('"', repeat(choice(/[^"\\]/, /\\./)), '"')),

    multiline_string: (_$) => token(seq('"""', repeat(choice(/[^"]/, /"[^"]/, /""[^"]/)), '"""')),

    integer: (_$) => token(/[0-9]+/),

    boolean: (_$) => choice("true", "false"),

    locale: (_$) => /[A-Za-z][A-Za-z0-9_-]*/,

    symbol: (_$) => /[@A-Za-z_][@A-Za-z0-9_\/-]*/,

    external_symbol: (_$) => choice(/[A-Za-z_][A-Za-z0-9_]*-[A-Za-z0-9_\/-]*/, /@[A-Za-z0-9_\/-]+/),

    identifier: (_$) => /[A-Za-z_][A-Za-z0-9_]*/,
  },
});
