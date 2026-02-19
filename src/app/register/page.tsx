'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import styles from '../login/Login.module.css';

type Role = 'PATIENT' | 'DOCTOR' | 'THERAPIST' | 'COUNSELLOR';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<'ROLE_SELECT' | 'FORM' | 'OTP'>('ROLE_SELECT');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [phone, setPhone] = useState('');
    const [consent, setConsent] = useState(false);
    const [otp, setOtp] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password validation logic
    const passwordRules = [
        { label: 'At least 8 characters', valid: password.length >= 8 },
        { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
        { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
        { label: 'Contains number', valid: /[0-9]/.test(password) },
        { label: 'Contains special character', valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const isPasswordValid = passwordRules.every(rule => rule.valid);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        setStep('FORM');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (selectedRole === 'PATIENT' && !consent) {
            setError('You must accept the consent agreement');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: selectedRole,
                    fullName,
                    email,
                    password,
                    dob: selectedRole === 'PATIENT' ? dob : undefined,
                    guardianName: selectedRole === 'PATIENT' ? guardianName : undefined,
                    phone
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setStep('OTP');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            router.push('/login?registered=true');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <Container className={styles.container}>
                <div className={styles.card}>
                    {step === 'ROLE_SELECT' && (
                        <>
                            <h1 className={styles.title}>Register</h1>
                            <p className={styles.subtitle}>Select your role to continue</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    onClick={() => handleRoleSelect('PATIENT')}
                                    className={styles.button}
                                    style={{ background: 'var(--primary)' }}
                                >
                                    Patient / Guardian
                                </button>
                                <button
                                    onClick={() => handleRoleSelect('DOCTOR')}
                                    className={styles.button}
                                    style={{ background: '#4a5568' }}
                                >
                                    Doctor
                                </button>
                                <button
                                    onClick={() => handleRoleSelect('THERAPIST')}
                                    className={styles.button}
                                    style={{ background: '#4a5568' }}
                                >
                                    Therapist
                                </button>
                                <button
                                    onClick={() => handleRoleSelect('COUNSELLOR')}
                                    className={styles.button}
                                    style={{ background: '#4a5568' }}
                                >
                                    Counsellor
                                </button>
                            </div>

                            <p className={styles.helperText} style={{ marginTop: '1.5rem' }}>
                                Already have an account? <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Login</Link>
                            </p>
                        </>
                    )}

                    {step === 'FORM' && (
                        <>
                            <h1 className={styles.title}>
                                {selectedRole === 'PATIENT' ? 'Patient Registration' : `${selectedRole} Registration`}
                            </h1>
                            <p className={styles.subtitle}>Fill in your details</p>

                            {error && (
                                <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c00', borderRadius: '4px', fontSize: '0.9rem' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className={styles.formSpace}>
                                <Input
                                    label="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    tooltip={
                                        <div>
                                            <p style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>Password Requirements:</p>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                {passwordRules.map((rule, idx) => (
                                                    <li key={idx} style={{
                                                        color: rule.valid ? '#4ade80' : '#ffa5a5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        marginBottom: '0.125rem'
                                                    }}>
                                                        <span>{rule.valid ? '✓' : '•'}</span>
                                                        {rule.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    }
                                />

                                {selectedRole === 'PATIENT' && (
                                    <>
                                        <Input
                                            label="Date of Birth"
                                            type="date"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />

                                        <Input
                                            label="Parent/Guardian Name"
                                            value={guardianName}
                                            onChange={(e) => setGuardianName(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </>
                                )}

                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />

                                {selectedRole === 'PATIENT' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={consent}
                                                onChange={(e) => setConsent(e.target.checked)}
                                                style={{ marginTop: '0.25rem' }}
                                            />
                                            <span>I consent to the collection and processing of my data for research purposes</span>
                                        </label>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={styles.button}
                                    style={{ marginTop: '1rem' }}
                                >
                                    {isLoading ? 'Registering...' : 'Register'}
                                </button>
                            </form>

                            <button
                                onClick={() => setStep('ROLE_SELECT')}
                                style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                ← Back to role selection
                            </button>
                        </>
                    )}

                    {step === 'OTP' && (
                        <>
                            <h1 className={styles.title}>Verify Email</h1>
                            <p className={styles.subtitle}>Enter the code sent to {email}</p>

                            {error && (
                                <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee', color: '#c00', borderRadius: '4px', fontSize: '0.9rem' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOTP} className={styles.formSpace}>
                                <Input
                                    label="Verification Code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    placeholder="Enter 6-digit code"
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={styles.button}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Complete Registration'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </Container>
        </div>
    );
}
