import { Plugin } from "@opencode/plugin"

export default Plugin.define({
    id: "rename-session",
    async setup(ctx) {
        await ctx.tool.transform((editor) => {
            editor.add({
                name: "rename_session",
                description:
                    "Rename the current session to a concise, descriptive title that " +
                    "reflects the task being worked on. Use this once the goal of the " +
                    "session is clear so the session list stays scannable.",
                input: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            minLength: 1,
                            description: "The new title for the current session.",
                        },
                    },
                    required: ["title"],
                    additionalProperties: false,
                },
                async execute(input, context) {
                    const { title } = input as { title: string }
                    await ctx.session.update({ sessionID: context.sessionID, title })
                    return { content: `Renamed session to ${title}` }
                },
            })
        })
    },
})
