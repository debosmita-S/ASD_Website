import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth/otp";
import { z } from "zod";

const verifySchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6)
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, otp } = verifySchema.parse(body);

        // Use hardened OTP verification
        const result = await verifyOTP(email, otp);

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error("Verification Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
