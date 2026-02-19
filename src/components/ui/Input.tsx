import React from 'react';
import styles from './Input.module.css';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    tooltip?: React.ReactNode;
}

export default function Input({ label, error, className, type, tooltip, ...props }: InputProps) {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={styles.inputWrapper}>
            {label && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <label className={styles.label} htmlFor={props.id || props.name} style={{ margin: 0 }}>{label}</label>
                    {tooltip && (
                        <div style={{ position: 'relative' }}>
                            <button
                                type="button"
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                onClick={() => setShowTooltip(!showTooltip)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'help',
                                    color: '#666',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                aria-label="More information"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            </button>
                            {showTooltip && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    marginBottom: '0.5rem',
                                    background: '#333',
                                    color: '#fff',
                                    padding: '0.75rem',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    width: 'max-content',
                                    maxWidth: '250px',
                                    zIndex: 10,
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    pointerEvents: 'none'
                                }}>
                                    {tooltip}
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        borderWidth: '5px',
                                        borderStyle: 'solid',
                                        borderColor: '#333 transparent transparent transparent'
                                    }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            <div style={{ position: 'relative' }}>
                <input
                    className={classNames(styles.input, className, { [styles.hasError]: !!error })}
                    type={inputType}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#666',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
