import { NextRequest } from "next/server";
import { POST as handleOcrPost } from "../route";

export async function POST(req: NextRequest) {
  return handleOcrPost(req);
}
