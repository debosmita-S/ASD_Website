'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/ui/Container';
import Link from 'next/link';

type DashboardData = {
    profile: {
        id: string;
        name: string;
        dob: string;
        institution: string;
    };
    screenings: Array<{ date: string; tool: string; risk: string; status: string }>;
    prescriptions: Array<{ id: string; date: string; details: string; doctor: string; downloadUrl: string | null }>;
    therapy: Array<{ date: string; summary: string; progress: string | null }>;
};

export default function PatientDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/patient/dashboard');
                if (!res.ok) throw new Error('Failed to load dashboard data');
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError('Could not load your dashboard. Please try logging in again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Container><div style={{ padding: '4rem 0', textAlign: 'center' }}>Loading your secure portal...</div></Container>;
    if (error) return <Container><div style={{ padding: '4rem 0', color: 'red' }}>{error}</div></Container>;
    if (!data) return null;

    return (
        <Container>
            <div style={{ padding: '4rem 0' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Verify ASD Patient Portal</h1>
                        <p style={{ color: '#666' }}>Secure Dashboard for <strong>{data.profile.name}</strong></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>ID: {data.profile.id}</div>
                        <div style={{ fontSize: '0.9rem', color: '#888' }}>{data.profile.institution}</div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Screenings */}
                    <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Screening History</h2>
                        {data.screenings.length === 0 ? (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>No screenings recorded.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {data.screenings.map((s, i) => (
                                    <li key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f5f5f5' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <strong>{s.tool}</strong>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                background: s.risk === 'HIGH' ? '#fee2e2' : '#dcfce7',
                                                color: s.risk === 'HIGH' ? '#b91c1c' : '#15803d'
                                            }}>{s.risk} Risk</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                            {new Date(s.date).toLocaleDateString()} • {s.status}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link href="/screening" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 500 }}>
                            Start New Screening →
                        </Link>
                    </div>

                    {/* Prescriptions */}
                    <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Prescriptions</h2>
                        {data.prescriptions.length === 0 ? (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>No prescriptions available.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {data.prescriptions.map((p) => (
                                    <li key={p.id} style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{p.details}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                            Dr. {p.doctor} • {new Date(p.date).toLocaleDateString()}
                                        </div>
                                        {p.downloadUrl && (
                                            <a href={p.downloadUrl} style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'inline-block', marginTop: '0.25rem' }}>
                                                Download PDF
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Therapy */}
                    <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Therapy Progress</h2>
                        {data.therapy.length === 0 ? (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>No therapy sessions found.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {data.therapy.map((t, i) => (
                                    <li key={i} style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{t.summary}</div>
                                        {t.progress && <div style={{ fontSize: '0.85rem', color: '#444', marginTop: '2px' }}>Progress: {t.progress}</div>}
                                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(t.date).toLocaleDateString()}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            </div>
        </Container>
    );
}
