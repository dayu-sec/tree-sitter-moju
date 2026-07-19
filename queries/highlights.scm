; MoJu Syntax Highlighting Queries

[
  "struct"
  "state"
  "event"
  "failure"
  "failure_policy"
  "command"
  "message"
  "actor"
  "lifecycle"
  "cap"
  "op"
  "flow"
  "verify"
  "layer"
  "dependency_rule"
  "module"
  "decision"
  "interface"
  "entry"
  "storage"
  "config"
  "dataflow"
  "target"
  "usecase"
  "subsystem"
  "scenario"
  "participant"
  "alt"
  "variant"
  "outcome"
  "meta"
  "label"
  "summary"
  "alias"
  "region"
  "orientation"
  "layout"
  "contains"
  "repeat"
  "separator"
  "impl"
  "profile"
  "react"
  "match"
  "retry_policy"
  "link"
  "network"
  "resource"
  "kind"
  "assembly"
  "run"
  "scale"
  "strategy"
  "bind"
  "for"
  "to"
  "by"
  "async"
  "initial"
  "transition"
  "forbid"
  "on"
  "input"
  "output"
  "ack"
  "result"
  "calls"
  "trigger"
  "require"
  "step"
  "ensure"
  "call"
  "with"
  "retry"
  "max"
  "backoff"
  "timeout"
  "use"
  "create"
  "emit"
  "change"
  "goto"
  "given"
  "mock"
  "when"
  "expect"
  "ensure_no_violation"
  "owns"
  "depends"
  "implements"
  "uses"
  "provides"
  "responsible_for"
  "not_responsible_for"
  "title"
  "context"
  "choose"
  "reject"
  "because"
  "accept_tradeoff"
  "mitigate"
  "revisit_when"
  "protocol"
  "access"
  "durability"
  "node"
  "edge"
  "data"
  "then"
  "ignore"
  "throw"
  "route"
  "primary_key"
  "index"
  "path"
  "content"
  "reload"
  "required"
  "default"
  "validate"
  "file"
  "env"
  "encoding"
  "expand"
  "strict_unknown_fields"
] @keyword

[
  "identity"
  "id"
  "can"
  "tag"
  "description"
  "creates"
  "unique"
] @keyword

[
  "true"
  "false"
  "none_external"
  "not_created"
  "transient"
  "persistent"
  "derived"
  "bin"
  "lib"
  "mod"
  "site"
  "app"
  "platform"
  "web"
  "desktop"
  "mobile"
  "sync"
  "query"
  "response"
  "ui"
  "page"
  "window"
  "section"
  "vertical"
  "horizontal"
  "grid"
  "scrollable"
  "fill_remaining"
  "keyboard_aware"
  "fixed_bottom"
  "table"
  "document"
  "key_value"
  "queue"
  "object"
  "search"
  "graph"
  "cache"
  "sqldb"
  "read"
  "write"
  "transform"
  "publish"
  "consume"
  "external"
  "http"
  "grpc"
  "cli"
  "toml"
  "yaml"
  "json"
] @constant.builtin

(struct_def name: (identifier) @type.definition)
(state_def name: (identifier) @type.definition)
(event_def name: (identifier) @type.definition)
(failure_def name: (identifier) @type.definition)
(failure_policy_def name: (identifier) @type.definition)
(message_def name: (identifier) @type.definition)
(command_def name: (identifier) @type.definition)
(actor_def name: (identifier) @type.definition)
(lifecycle_def name: (identifier) @type.definition)
(capability_def name: (identifier) @type.definition)
(flow_def name: (identifier) @type.definition)
(verify_def name: (identifier) @type.definition)
(usecase_def name: (identifier) @type.definition)
(scenario_def name: (identifier) @type.definition)
(subsystem_def name: (identifier) @type.definition)
(module_def name: (identifier) @type.definition)
(decision_def name: (identifier) @type.definition)
(interface_def name: (identifier) @type.definition)
(storage_def name: (identifier) @type.definition)
(config_def name: (identifier) @type.definition)
(dataflow_def name: (identifier) @type.definition)
(region_def name: (identifier) @type.definition)
(node_def name: (identifier) @type.definition)
(resource_def name: (identifier) @type.definition)
(network_def name: (identifier) @type.definition)
(assembly_def name: (identifier) @type.definition)
(profile_def name: (identifier) @type.definition)

(interface_entry name: (identifier) @type.definition)
(config_item name: (identifier) @property)

(operation_def name: (identifier) @function.method)
(struct_op_def name: (ref) @function.method)
(step_def name: (identifier) @label)

(field_def name: (identifier) @property)
(event_field name: (identifier) @property)
(command_field name: (identifier) @property)
(assignment name: (identifier) @property)
(setting key: (path) @property)
(object_property key: (identifier) @property)

(string) @string
(multiline_string) @string
(integer) @number
(duration) @number
(boolean) @constant.builtin
(comment) @comment

[
  "->"
  "+="
  "="
  ">="
  ">"
  "=="
  "includes"
  "in"
  ":"
] @operator

(path) @variable.member
(identifier) @variable
