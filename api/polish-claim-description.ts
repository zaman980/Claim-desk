import { handlePolishRequest } from "../server/polish-claim";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  return handlePolishRequest(request, process.env.GEMINI_API_KEY);
}
