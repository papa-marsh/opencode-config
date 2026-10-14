import { Plugin } from "@opencode/plugin"

export default Plugin.define({
    id: "session-id-env",
    setup() {
        // OpenCode injects OPENCODE_SESSION_ID per shell call, so no hook is needed.
    },
})
