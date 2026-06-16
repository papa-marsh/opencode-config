import { type Plugin, tool } from "@opencode-ai/plugin"

/**
 * Registers a `rename_session` tool that lets an agent rename the active
 * session it is running in. The tool reads the current session ID from the
 * tool-call context and issues a session update via the opencode SDK client.
 */
export default (async ({ client }) => {
    return {
        tool: {
            rename_session: tool({
                description:
                "Rename the current session to a concise, descriptive title that " +
                "reflects the task being worked on. Use this once the goal of the " +
                "session is clear so the session list stays scannable.",
                args: {
                    title: tool.schema
                        .string()
                        .min(1)
                        .describe("The new title for the current session."),
                },
                async execute({ title }, context) {
                    await client.session.update({
                        path: { id: context.sessionID },
                        query: { directory: context.directory },
                        body: { title },
                    })

                    return `Renamed session to ${title}`
                },
            }),
        },
    }
}) satisfies Plugin
