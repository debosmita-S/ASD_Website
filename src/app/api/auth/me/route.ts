import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
    const sessionToken = req.cookies.get("session")?.value;

    if (!sessionToken) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    const payload = await decryptSession(sessionToken);

    if (!payload) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    // Return partial user info (safe for client)
    return NextResponse.json({
        user: {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            fullName: payload.fullName
        }
    });
}
