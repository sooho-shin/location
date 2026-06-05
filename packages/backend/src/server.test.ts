import http from "http";
import type { AddressInfo } from "net";
import { app, trimDescription } from "./server";

interface HealthResponse {
  status?: unknown;
  timestamp?: unknown;
}

describe("server", () => {
  it("returns health status", async () => {
    const server = http.createServer(app);

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      const body = (await response.json()) as HealthResponse;

      expect(response.status).toBe(200);
      expect(body.status).toBe("ok");
      expect(typeof body.timestamp).toBe("string");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  });

  it("trims long descriptions", () => {
    expect(trimDescription("1234567890123456789012345")).toBe("12345678901234567890...");
  });
});
