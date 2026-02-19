import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateOTP } from "@/lib/auth/otp";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z.string().email("Valid email is required")
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = forgotPasswordSchema.parse(body);

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Don't reveal if user exists (security best practice)
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset code."
            });
        }

        // Generate and send OTP
        await generateOTP(email, 'password-reset');

        return NextResponse.json({
            success: true,
            message: "Password reset code sent to your email."
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
