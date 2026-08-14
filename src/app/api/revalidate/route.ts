import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type RevalidateBody = {
  tag?: unknown;
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as RevalidateBody;
    const tag = typeof body.tag === "string" ? body.tag.trim() : "";

    if (!tag) {
      return NextResponse.json(
        { message: "Missing or invalid tag" },
        { status: 400 },
      );
    }

    revalidateTag(tag, "max");

    return NextResponse.json({ revalidated: true, tag });
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }
}
