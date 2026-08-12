import { mkdir, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"

export const SessionExporter: Plugin = async ({ client }) => ({
    tool: {
        dump_session: tool({
            description: "Export the complete persisted OpenCode session transcript",
            args: {
                folder: tool.schema.string(),
            },
            async execute({ folder }, context) {
                const response = await client.session.messages({
                    path: { id: context.sessionID },
                    query: { directory: context.directory },
                })

                if (response.error) {
                    throw new Error(`Failed to load session: ${JSON.stringify(response.error)}`)
                }

                const outputDir = resolve(context.directory, folder)
                const outputFile = join(outputDir, `${context.sessionID}.json`)

                await mkdir(outputDir, { recursive: true })
                await writeFile(outputFile, JSON.stringify(response.data, null, 2))

                return `Exported session transcript to ${outputFile}`
            },
        }),
    },
})
