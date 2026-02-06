import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Check, Loader2 } from 'lucide-react';
import api from '../services/api';

type Step = 'email' | 'password' | 'success';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/password-reset-request', { email });
            setStep('password');
        } catch (err: any) {
            setError(err.response?.data?.detail || '验证失败，请检查邮箱是否正确');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (newPassword.length < 6) {
            setError('密码长度至少为6位');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/password-reset', { email, new_password: newPassword });
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.detail || '密码重置失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-2 flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                {/* Back button */}
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-gray-1 hover:text-black transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-body text-sm">返回登录</span>
                </button>

                <div className="bg-white p-8 border border-gray-3">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl text-black">素居</h1>
                        <p className="font-body text-gray-1 mt-2">
                            {step === 'email' && '找回密码'}
                            {step === 'password' && '设置新密码'}
                            {step === 'success' && '重置成功'}
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-3 mb-8">
                        {['email', 'password', 'success'].map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body
                                    ${step === s ? 'bg-black text-white' :
                                        ['email', 'password', 'success'].indexOf(step) > i ? 'bg-black text-white' : 'bg-gray-3 text-gray-1'}`}>
                                    {['email', 'password', 'success'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
                                </div>
                                {i < 2 && <div className={`w-12 h-[1px] ${['email', 'password', 'success'].indexOf(step) > i ? 'bg-black' : 'bg-gray-3'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-body">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Email verification */}
                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-body text-gray-4">注册邮箱</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="请输入注册时使用的邮箱"
                                        required
                                        className="w-full h-12 pl-12 pr-4 border border-gray-3 focus:border-black focus:ring-0 font-body"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-black text-white font-body tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '验证邮箱'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Set new password */}
                    {step === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-body text-gray-4">新密码</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-5" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="请输入新密码（6-32位）"
                                        required
                                        className="w-full h-12 pl-12 pr-4 border border-gray-3 focus:border-black focus:ring-0 font-body"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-body text-gray-4">确认密码</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-5" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="请再次输入新密码"
                                        required
                                        className="w-full h-12 pl-12 pr-4 border border-gray-3 focus:border-black focus:ring-0 font-body"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-black text-white font-body tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '重置密码'}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="font-body text-gray-1">密码已成功重置，请使用新密码登录</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full h-12 bg-black text-white font-body tracking-wider hover:bg-gray-800 transition-colors"
                            >
                                返回登录
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
