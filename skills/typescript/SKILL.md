---
name: typescript
description: "TypeScript conventions \u2014 type patterns, Zod usage, error handling, imports, async, and anti-patterns"
---

# TypeScript Conventions

Team conventions for writing TypeScript. Load this when writing, reviewing, or debugging TypeScript code in any team repository.

---

## Type Safety

- **Strict mode always.** All projects use `"strict": true` in tsconfig. Never weaken strictness.
- **No `any`.** Use `unknown` when the type is genuinely unknown, then narrow with type guards, Zod parsing, or `instanceof`. When an agent is unsure of a type, `unknown` + narrowing is always the right move.
- **Minimize type assertions.** Prefer type guards over `as`. Acceptable uses:
  - After runtime validation: `schema.parse(data) as ValidatedType`
  - Known third-party library types: `response as LibraryType`
  - These are escape hatches, not defaults.

---

## Zod as Source of Truth

Zod schemas define data shapes. TypeScript types are derived from them, not the other way around.

```typescript
// Correct: schema first, type derived
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'member']),
});
type User = z.infer<typeof userSchema>;

// Wrong: manual type that duplicates a schema
interface User {
  id: string;
  name: string;
  role: 'admin' | 'member';
}
```

**Where Zod schemas drive types:**
- Request/response validation (Hono + `@hono/zod-openapi`)
- Database schemas (via `drizzle-zod`: `createInsertSchema`, `createSelectSchema`)
- Vendor configuration schemas (environment, static config, credentials)
- Cross-service message contracts

**The rule:** If data crosses a boundary (API, database, service-to-service, config), it should have a Zod schema. Internal function signatures don't need Zod — regular TypeScript types are fine there.

---

## Error Handling

Two patterns, used for different situations:

**Result types for expected failures.** When a function can fail in ways the caller needs to handle, return a discriminated union:

```typescript
type RefreshResult =
  | { success: true; credentials: Credentials; expiresAt: Date }
  | { success: false; errorCode: string; errorMessage: string };
```

Callers check `result.success` and handle both branches. This makes the failure path explicit and type-safe. Use this for business logic outcomes where failure is a normal possibility (auth flows, validation, external API calls).

**Thrown errors for unexpected failures.** Custom error classes with a `name` property for errors that represent bugs or infrastructure failures:

```typescript
class IntegrationValidationError extends Error {
  name = 'IntegrationValidationError';
  constructor(public field: string, public value: unknown) {
    super(`Invalid ${field}: ${String(value)}`);
  }
}
```

**Boundary rule:** API route handlers are the catch boundary. They wrap calls in try/catch and return structured error responses. Utility and domain functions below the handler layer throw — they don't catch and swallow.

---

## Imports

- **Absolute imports via path aliases.** Use `@src/*` and `@test/*` aliases. Never use parent-relative imports (`../`). Same-directory relative (`./`) is fine.
- **`import type` for type-only imports.** When importing something used only as a type, use `import type { Foo }` to make the intent explicit and allow the bundler to tree-shake.
- **Import ordering** (enforced by Prettier plugin):
  1. `cloudflare:*` (Workers built-in modules)
  2. `@cloudflare/*` (Cloudflare packages)
  3. Third-party modules
  4. `@src/*`
  5. `@test/*`
  6. `./` (same-directory)

  Groups separated by blank lines, specifiers sorted alphabetically within each group.

- **Barrel files at module boundaries.** Public-facing modules export through `index.ts`. Internal implementation files are imported directly within the module.

---

## Async Patterns

- **`async/await` everywhere.** No raw `.then()` chains except inside `Promise.all` callbacks where a single transform is cleaner:
  ```typescript
  const [config, creds] = await Promise.all([
    decrypt(row.configEncrypted, env).then((d) => JSON.parse(d) as unknown),
    decrypt(row.credsEncrypted, env).then((d) => JSON.parse(d) as unknown),
  ]);
  ```
- **No floating promises.** Every promise must be awaited, returned, or explicitly voided. ESLint enforces `@typescript-eslint/no-floating-promises`.
- **`void` prefix for intentional fire-and-forget:**
  ```typescript
  void ctx.blockConcurrencyWhile(async () => { /* ... */ });
  ```
- **Concurrency guards for long-running operations.** Set a boolean flag synchronously (before any `await`) to prevent duplicate work. Clear it in `finally`:
  ```typescript
  if (this._refreshing) return { success: false, /* ... */ };
  this._refreshing = true;
  try { /* async work */ } finally { this._refreshing = false; }
  ```

---

## Code Style

- **File and directory naming:** kebab-case. `oauth-handler.ts`, `auth-handlers/`, `v1-integrations/`.
- **Test files:** `<name>.test.ts` for unit tests, `<name>.integration.test.ts` for integration tests. Test directory mirrors source structure.
- **Formatting:** Prettier with 120-char line width, single quotes, semicolons, 2-space indentation.
- **Unused variables:** Prefix with `_` (e.g., `_unused`). ESLint enforces `@typescript-eslint/no-unused-vars` with the underscore exception.
- **Return types:** Inferred by default. Explicit return type annotations are not required — the team has `explicit-function-return-type` turned off. Add them when it improves readability (complex functions, public API surfaces).
- **JSDoc comments:** Use `/** ... */` with `@param`, `@returns`, `@throws`, `@remarks`, `@example` tags for non-obvious functions — especially public API surfaces, complex logic, and anything where the "why" isn't clear from the code.

---

## Type Design Patterns

**`as const satisfies` for type-safe registries:**

```typescript
const authHandlerRegistry = {
  GITHUB: { github_app: githubAppHandler },
  DROPBOX: { oauth: dropboxOauthHandler },
} as const satisfies AuthHandlerRegistryShape;
```

This gives you both exhaustive type checking (via `satisfies`) and literal type inference (via `as const`).

**Builder/helper functions for generic inference:**

When a type has complex generics, provide a helper function so callers get inference without manually specifying type parameters:

```typescript
// Users call defineVendor({ ... }) — generics are inferred
export function defineVendor<V extends VendorDefinition>(def: V): V { return def; }
```

**Derived types from registries:**

```typescript
export type VendorId = keyof VendorRegistry;
export type AuthMethodsOf<V extends VendorId> = keyof VendorRegistry[V]['authMethods'] & string;
```

Register concrete definitions in a registry object, then derive union types and mapped types from it. This keeps the type system in sync with runtime data automatically.

---

## Anti-Patterns

These are explicitly avoided in team code:

- **`any`** — Always `unknown` + narrowing. No exceptions.
- **TypeScript `enum`** — Use `as const` objects or Zod enums. TS enums have footguns: numeric enums auto-increment silently, string enums aren't iterable, and they emit runtime code unlike most TS constructs.
- **Classes for data shapes** — Use plain objects + Zod schemas for data. Classes are appropriate for behavioral abstractions (like `BaseAuthHandler`) but not for representing data.
- **`namespace`** — Legacy TS feature incompatible with ESM. Use modules.
- **`I`-prefix on interfaces** — (`IFoo`, `IUser`). Not a TypeScript convention; comes from C#.
- **Parent-relative imports** — (`../foo`). Use `@src/*` aliases.
