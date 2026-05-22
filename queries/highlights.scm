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
  "query"
  "response"
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
(module_def name: (identifier) @type.definition)
(decision_def name: (identifier) @type.definition)
(interface_def name: (identifier) @type.definition)
(storage_def name: (identifier) @type.definition)
(config_def name: (identifier) @type.definition)
(dataflow_def name: (identifier) @type.definition)

(interface_entry name: (identifier) @type.definition)
(config_item name: (identifier) @property)

(operation_def name: (identifier) @function.method)
(step_def name: (identifier) @label)

(field_def name: (identifier) @property)
(event_field name: (identifier) @property)
(command_field name: (identifier) @property)
(assignment name: (identifier) @property)
(setting key: (identifier) @property)

(string) @string
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
