import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });

    // Delete the session cookie
    response.cookies.set('session', '', {
        httpOnly: true,
        expires: new Date(0), // Set to past date to deleting
        path: '/'
    });

    return response;
}
