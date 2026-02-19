'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import styles from './Login.module.css';

import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { refreshUser } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Refresh auth state before redirecting
            await refreshUser();

            // Redirect to role-specific dashboard
            router.push(data.redirectUrl);

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
                    <h1 className={styles.title}>Login</h1>
                    <p className={styles.subtitle}>
                        Please sign in with your credentials
                    </p>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            background: '#fee',
                            color: '#c00',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className={styles.formSpace}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={styles.button}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        <p className={styles.helperText}>
                            New user? <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Register</Link>
                        </p>
                        <p className={styles.helperText} style={{ marginTop: '0.5rem' }}>
                            <Link href="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Forgot Password?</Link>
                        </p>
                    </div>

                    <div className={styles.footer}>
                        <p style={{ fontSize: '0.75rem', color: '#999' }}>Restricted to authorized personnel only.</p>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#999' }}>
                            Contact at : <a href="mailto:smartasdplatform@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>smartasdplatform@gmail.com</a>
                        </p>
                    </div>

                </div>
            </Container>
        </div>
    );
}
