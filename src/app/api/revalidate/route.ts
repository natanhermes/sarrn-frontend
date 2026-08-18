import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type RevalidateBody = {
  tag?: unknown;
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  const expectedSecret = process.env.REVALIDATE_SECRET;
  const isAuthorized = Boolean(secret && secret === expectedSecret);

  console.log(
    `[revalidate webhook] Auth status: ${isAuthorized ? "AUTHORIZED" : "UNAUTHORIZED"} | Header present: ${Boolean(secret)} | REVALIDATE_SECRET configured: ${Boolean(expectedSecret)}`
  );

  if (!isAuthorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as RevalidateBody;
    const tag = typeof body.tag === "string" ? body.tag.trim() : "";

    console.log(`[revalidate webhook] Received tag: "${tag}"`);

    if (!tag) {
      console.warn("[revalidate webhook] Missing or invalid tag in body:", body);
      return NextResponse.json(
        { message: "Missing or invalid tag" },
        { status: 400 },
      );
    }

    revalidateTag(tag, "max");
    console.log(`[revalidate webhook] Successfully revalidated tag: "${tag}"`);

    return NextResponse.json({ revalidated: true, tag });
  } catch (error) {
    console.error("[revalidate webhook] Error parsing request body:", error);
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }
}
