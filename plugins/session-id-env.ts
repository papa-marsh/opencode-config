import type { Plugin } from "@opencode-ai/plugin"

export default (async () => {
    return {
        "shell.env": async (input, output) => {
            if (input.sessionID) {
                output.env.OPENCODE_SESSION_ID = input.sessionID
            }
        },
    }
}) satisfies Plugin
