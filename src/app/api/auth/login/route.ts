import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(1, "Password is required")
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = loginSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        // Generic error to prevent user enumeration
        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Check if account is active
        if (!user.isActive) {
            return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return NextResponse.json({
                error: "Account not verified. Please complete email verification first."
            }, { status: 403 });
        }

        // Create session
        const sessionToken = await createSession({
            userId: user.id,
            email: user.email!,
            role: user.role.name,
            fullName: user.fullName || ''
        });

        // Set HttpOnly cookie
        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            redirectUrl: getRoleBasedDashboard(user.role.name)
        });

        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;

    } catch (error) {
        console.error("Login Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}

function getRoleBasedDashboard(role: string): string {
    const dashboardMap: Record<string, string> = {
        'ADMIN': '/admin/dashboard',
        'DOCTOR': '/doctor/dashboard',
        'THERAPIST': '/therapist/dashboard',
        'COUNSELLOR': '/counsellor/dashboard',
        'PATIENT': '/patient/dashboard'
    };
    return dashboardMap[role] || '/dashboard';
}
