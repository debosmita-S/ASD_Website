import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyOTP } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

const resetPasswordSchema = z.object({
    email: z.string().email("Valid email is required"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, otp, newPassword } = resetPasswordSchema.parse(body);

        // Verify OTP
        const otpResult = await verifyOTP(email, otp);

        if (!otpResult.success) {
            return NextResponse.json({ error: otpResult.message }, { status: 401 });
        }

        // Hash new password
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { email },
            data: { passwordHash }
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'PASSWORD_RESET_SUCCESS',
                resource: 'User',
                resourceId: email,
                severity: 'INFO'
            }
        });

        return NextResponse.json({
            success: true,
            message: "Password reset successful. You can now login with your new password."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
    }
}
