'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout, isLoading } = useAuth();
    const isAuthPage = ['/login', '/register', '/forgot-password'].some(p => pathname?.startsWith(p));

    if (isAuthPage) return null;

    return (
        <nav className={styles.navbar}>
            <Container className={styles.navContainer}>
                <div className={styles.logo}>
                    <Link href="/">ASD Research Platform</Link>
                </div>
                <ul className={styles.navLinks}>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/about">About</Link></li>
                    <li><Link href="/research">Research</Link></li>
                    {!isLoading && (
                        user ? (
                            <>

                                <li>
                                    <button
                                        onClick={logout}
                                        className={styles.authLink}
                                        style={{ cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li><Link href="/login" className={styles.authLink}>Login</Link></li>
                        )
                    )}
                </ul>
            </Container>
        </nav>
    );
}
