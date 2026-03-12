export async function withAsync<T>(fn: () => Promise<T>): Promise<{
  response: T | null;
  error: unknown | null;
}> {
  try {
    if (typeof fn !== "function") {
      throw new Error("withAsync: argument must be a function");
    }
    const response = await fn();
    return { response, error: null };
  } catch (error) {
    return { response: null, error };
  }
}
