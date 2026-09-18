// @vitest-environment node

import { describe, expect, it } from "vitest"
import type { UserConfig } from "vite"

import config from "../../vite.config"

describe("Vite development proxy", () => {
  it("forwards API requests to the FastAPI server on port 8010", () => {
    const resolved = config as UserConfig

    expect(resolved.server?.proxy?.["/api"]).toBe("http://127.0.0.1:8010")
  })
})
