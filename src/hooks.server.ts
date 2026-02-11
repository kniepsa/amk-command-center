import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // Get the authorization header
  const auth = event.request.headers.get("authorization");

  // Check if authorization header exists
  if (!auth) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Command Center - Private Access"',
      },
    });
  }

  // Parse the Basic auth credentials
  const [scheme, encoded] = auth.split(" ");

  if (scheme !== "Basic") {
    return new Response("Invalid authentication scheme", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Command Center - Private Access"',
      },
    });
  }

  // Decode base64 credentials
  const credentials = atob(encoded || "").split(":");
  const [username, password] = credentials;

  // Get password from environment variable
  const correctPassword = process.env.PASSWORD || "changeme";

  // Verify password (username can be anything)
  if (password !== correctPassword) {
    return new Response("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Command Center - Private Access"',
      },
    });
  }

  // Authentication successful, proceed with the request
  return resolve(event);
};
