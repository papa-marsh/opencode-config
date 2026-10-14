import { execFile } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { promisify } from "node:util"
import { Plugin } from "@opencode/plugin"

const execFileAsync = promisify(execFile)

export default Plugin.define({
    id: "export-session-transcript",
    async setup(ctx) {
        await ctx.tool.transform((editor) => {
            editor.add({
                name: "dump_session",
                description: "Export the complete persisted OpenCode session transcript",
                input: {
                    type: "object",
                    properties: { folder: { type: "string" } },
                    required: ["folder"],
                    additionalProperties: false,
                },
                async execute(input, context) {
                    const { folder } = input as { folder: string }
                    const session = await ctx.session.get({ sessionID: context.sessionID })
                    const directory = resolve(session.location.directory, session.subpath ?? "")
                    // The plugin context lacks export; the CLI preserves server discovery and authentication.
                    const { stdout } = await execFileAsync("opencode", [
                        "api", "get",
                        `/api/experimental/session/${encodeURIComponent(context.sessionID)}/export?sanitize=false`,
                    ], {
                        cwd: directory,
                        signal: context.signal,
                        maxBuffer: 64 * 1024 * 1024,
                    })
                    const response: { data?: { messages?: unknown[] } } = JSON.parse(stdout)
                    if (!Array.isArray(response.data?.messages)) {
                        throw new Error("Session export did not return a transcript")
                    }
                    const outputDir = resolve(directory, folder)
                    const outputFile = join(outputDir, `transcript-${context.sessionID}.json`)

                    await mkdir(outputDir, { recursive: true })
                    await writeFile(outputFile, JSON.stringify(response.data.messages, null, 2))

                    return { content: `Exported session transcript to ${outputFile}` }
                },
            })
        })
    },
})
