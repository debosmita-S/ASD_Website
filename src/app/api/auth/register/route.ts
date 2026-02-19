import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { generateOTP } from "@/lib/auth/otp";
import { z } from "zod";

const registerSchema = z.object({
    role: z.enum(['PATIENT', 'DOCTOR', 'THERAPIST', 'COUNSELLOR']),
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().min(10, "Valid phone number is required"),
    dob: z.string().optional(),
    guardianName: z.string().optional()
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("[Register] Request body:", { ...body, password: '[REDACTED]' });

        const data = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { phone: data.phone }
                ]
            }
        });

        if (existingUser) {
            console.warn(`[Register] User already exists: ${data.email}`);
            return NextResponse.json({ error: "Account already exists with this email or phone" }, { status: 400 });
        }

        // Get role ID
        const role = await prisma.role.findUnique({
            where: { name: data.role }
        });

        if (!role) {
            console.error(`[Register] Invalid role: ${data.role}`);
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        // Hash password
        const passwordHash = await hashPassword(data.password);

        // Create user (unverified)
        const user = await prisma.user.create({
            data: {
                email: data.email,
                phone: data.phone,
                fullName: data.fullName,
                roleId: role.id,
                passwordHash,
                isVerified: false,
                verificationMethod: 'email',
                isActive: true // Auto-activate everyone as per requirement
            }
        });
        console.log(`[Register] User created: ${user.id}`);

        // If patient, create patient record
        if (data.role === 'PATIENT' && data.dob && data.guardianName) {

            // Safer institution fetch
            const institution = await prisma.institution.findFirst();
            if (!institution) {
                throw new Error("No institution found to link patient");
            }

            const patientUniqueId = `SMART-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            await prisma.patient.create({
                data: {
                    patientUniqueId,
                    firstName: data.fullName.split(' ')[0],
                    lastName: data.fullName.split(' ').slice(1).join(' ') || '',
                    dob: new Date(data.dob),
                    gender: 'Not Specified',
                    guardianId: user.id,
                    guardianName: data.guardianName,
                    guardianPhone: data.phone,
                    institutionId: institution.id
                }
            });
            console.log(`[Register] Patient record created: ${patientUniqueId}`);
        }

        // Generate OTP
        const otp = await generateOTP(data.email);
        console.log(`[Register] OTP generated for ${data.email}: ${otp}`);

        return NextResponse.json({
            success: true,
            message: "Registration successful. Please check your email for verification code.",
            email: data.email
        });

    } catch (error: any) {
        console.error("Registration Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
        }

        return NextResponse.json({
            error: "Registration failed",
            details: error?.message || "Unknown error"
        }, { status: 500 });
    }
}
