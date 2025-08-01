import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  // Şimdilik mock yanıt dön
  return NextResponse.json({
    result: `// AI suggestion for: ${prompt}\n\n---\n+ const darkMode = true;`,
  });
}
