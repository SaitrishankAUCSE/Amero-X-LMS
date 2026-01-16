'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { Shield, Smartphone, Key, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function TwoFactorSetup() {
    const [factorId, setFactorId] = useState('')
    const [qrCode, setQrCode] = useState('')
    const [secret, setSecret] = useState('')
    const [verifyCode, setVerifyCode] = useState('')
    const [status, setStatus] = useState<'idle' | 'enrolling' | 'verifying' | 'enabled'>('idle')
    const supabase = createBrowserClient()

    const startEnrollment = async () => {
        try {
            setStatus('enrolling')
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                issuer: 'AmeroX LMS',
            })

            if (error) throw error

            setFactorId(data.id)
            setQrCode(data.totp.qr_code)
            setSecret(data.totp.secret)
        } catch (error: any) {
            toast.error(error.message)
            setStatus('idle')
        }
    }

    const verifyEnrollment = async () => {
        if (verifyCode.length !== 6) return

        try {
            setStatus('verifying')
            const { error } = await supabase.auth.mfa.challengeAndVerify({
                factorId,
                code: verifyCode,
            })

            if (error) throw error

            toast.success('2FA enabled successfully!')
            setStatus('enabled')
        } catch (error: any) {
            toast.error(error.message)
            setStatus('enrolling')
        }
    }

    if (status === 'enabled') {
        return (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg">2FA is Enabled</h3>
                <p className="text-sm text-muted-foreground">Your account is now extra secure.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {status === 'idle' ? (
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold">Two-Factor Authentication</h3>
                            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                        </div>
                    </div>
                    <button
                        onClick={startEnrollment}
                        className="w-full btn-secondary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Smartphone className="w-4 h-4" />
                        Enable 2FA
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4"
                >
                    <div className="text-center">
                        <p className="text-sm font-medium mb-4">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                        {qrCode && (
                            <div className="bg-white p-4 rounded-xl inline-block mb-4">
                                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mb-6">
                            Or enter the code manually: <code className="bg-black/40 px-2 py-1 rounded text-white font-mono">{secret}</code>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">6-Digit Verification Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={6}
                                className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                                placeholder="000000"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value)}
                            />
                            <button
                                onClick={verifyEnrollment}
                                disabled={verifyCode.length !== 6 || status === 'verifying'}
                                className="px-6 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
                            >
                                {status === 'verifying' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
