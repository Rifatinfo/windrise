'use client';

import { useRef, useState } from 'react';
import { Camera, Eye, EyeOff, KeyRound, Trash2, UserRoundIcon } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { getRoleLabel, getUserAvatar } from '@/utiles/user-utils';
import { Toast } from '@/components/shared/Toast/Toast';
import Spinner from '@/components/shared/Spinner';
import { changeMyPassword, updateMyProfile } from '@/services/user/profile';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB
const MIN_PASSWORD_LENGTH = 6;

/** Role profiles carry the phone number; the base user record does not. */
const getUserPhone = (user: {
    admin?: { phone?: string | null };
    shopManager?: { phone?: string | null };
    mediaManager?: { phone?: string | null };
}) =>
    user.admin?.phone ?? user.shopManager?.phone ?? user.mediaManager?.phone ?? '';

export default function MyProfileClient() {
    const { user, loading } = useAuth();

    // ---- profile photo
    const fileRef = useRef<HTMLInputElement>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);

    // ---- personal information
    const [name, setName] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');

    // ---- change password
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    if (loading) {
        return (
            <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
                <Spinner size={18} /> Loading your profile…
            </div>
        );
    }

    if (!user) {
        return <p className="p-6 text-sm text-slate-500">Could not load your profile.</p>;
    }

    // Fall back to the saved values until the fields are edited.
    const nameValue = name ?? user.name ?? '';
    const phoneValue = phone ?? getUserPhone(user);
    const savedAvatar = getUserAvatar(user);
    const shownAvatar = removePhoto ? '' : photoPreview ?? savedAvatar;
    const initial = (user.name ?? '?').trim().charAt(0).toUpperCase();

    const pickPhoto = (file: File | undefined) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            Toast.fire({ icon: 'error', title: 'Please choose an image file.' });
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            Toast.fire({ icon: 'error', title: 'Photo must be 2 MB or smaller.' });
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setRemovePhoto(false);
    };

    const clearPhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setRemovePhoto(Boolean(savedAvatar));
        if (fileRef.current) fileRef.current.value = '';
    };

    const saveProfile = async () => {
        const trimmed = nameValue.trim();
        if (trimmed.length < 2) {
            setProfileError('Name must be at least 2 characters long.');
            return;
        }
        setProfileError('');
        setSavingProfile(true);

        const formData = new FormData();
        formData.append(
            'data',
            JSON.stringify({
                name: trimmed,
                phone: phoneValue.trim(),
                removeAvatar: removePhoto,
            })
        );
        if (photoFile) formData.append('file', photoFile);

        const result = await updateMyProfile(formData);
        setSavingProfile(false);

        if (!result.success) {
            setProfileError(result.message);
            Toast.fire({ icon: 'error', title: result.message });
            return;
        }

        Toast.fire({ icon: 'success', title: result.message });
        // Reload so the header, sidebar and this page all show the new
        // name/photo rather than the cached copy.
        window.setTimeout(() => window.location.reload(), 800);
    };

    const savePassword = async () => {
        if (!oldPassword) {
            setPasswordError('Enter your current password.');
            return;
        }
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            setPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New password and confirmation do not match.');
            return;
        }
        if (newPassword === oldPassword) {
            setPasswordError('New password must be different from the current one.');
            return;
        }
        setPasswordError('');
        setSavingPassword(true);

        const result = await changeMyPassword(oldPassword, newPassword);
        setSavingPassword(false);

        if (!result.success) {
            setPasswordError(result.message);
            Toast.fire({ icon: 'error', title: result.message });
            return;
        }

        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Toast.fire({ icon: 'success', title: result.message });
    };

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-10">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Edit Profile</h1>
                <p className="mt-0.5 text-sm text-slate-500">
                    Manage your photo, personal details and password.
                </p>
            </div>

            {/* ---------- Profile photo ---------- */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                    <Camera className="h-4 w-4" /> Profile Photo
                </h2>

                <div className="mt-4 flex flex-wrap items-center gap-5">
                    {shownAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={shownAvatar}
                            alt={user.name}
                            className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-slate-100"
                        />
                    ) : (
                        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-2xl font-semibold text-white ring-4 ring-slate-100">
                            {initial}
                        </span>
                    )}

                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer"
                            >
                                <Camera className="h-3.5 w-3.5" />
                                {shownAvatar ? 'Change photo' : 'Upload photo'}
                            </button>

                            {shownAvatar && (
                                <button
                                    type="button"
                                    onClick={clearPhoto}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400">JPG, PNG or WebP — up to 2 MB.</p>
                        {removePhoto && (
                            <p className="text-xs font-medium text-amber-600">
                                Photo will be removed when you save.
                            </p>
                        )}
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => pickPhoto(e.target.files?.[0])}
                    />
                </div>
            </section>

            {/* ---------- Personal information ---------- */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                    <UserRoundIcon className="h-4 w-4" /> Personal Information
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="Full Name" htmlFor="profile-name">
                        <input
                            id="profile-name"
                            value={nameValue}
                            onChange={(e) => { setName(e.target.value); setProfileError(''); }}
                            placeholder="Your name"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Phone" htmlFor="profile-phone">
                        <input
                            id="profile-phone"
                            value={phoneValue}
                            onChange={(e) => { setPhone(e.target.value); setProfileError(''); }}
                            placeholder="e.g. 01712345678"
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Email" htmlFor="profile-email">
                        <input
                            id="profile-email"
                            value={user.email ?? ''}
                            readOnly
                            className="h-10 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            Email is your sign-in identity and can&apos;t be changed here.
                        </p>
                    </Field>

                    <Field label="Role">
                        <div className="flex h-10 items-center">
                            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                                {getRoleLabel(user.role)}
                            </span>
                        </div>
                    </Field>
                </div>

                {profileError && (
                    <p className="mt-3 text-sm font-medium text-red-600">{profileError}</p>
                )}

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={saveProfile}
                        disabled={savingProfile}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {savingProfile && <Spinner size={16} />}
                        Save Changes
                    </button>
                </div>
            </section>

            {/* ---------- Change password ---------- */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                        <KeyRound className="h-4 w-4" /> Change Password
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowPasswords((v) => !v)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                        {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {showPasswords ? 'Hide' : 'Show'}
                    </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <Field label="Current Password" htmlFor="current-password">
                            <input
                                id="current-password"
                                type={showPasswords ? 'text' : 'password'}
                                value={oldPassword}
                                autoComplete="current-password"
                                onChange={(e) => { setOldPassword(e.target.value); setPasswordError(''); }}
                                className={inputClass}
                            />
                        </Field>
                    </div>

                    <Field label="New Password" htmlFor="new-password">
                        <input
                            id="new-password"
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            autoComplete="new-password"
                            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Confirm New Password" htmlFor="confirm-password">
                        <input
                            id="confirm-password"
                            type={showPasswords ? 'text' : 'password'}
                            value={confirmPassword}
                            autoComplete="new-password"
                            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                            className={inputClass}
                        />
                    </Field>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                    Use at least {MIN_PASSWORD_LENGTH} characters.
                </p>

                {passwordError && (
                    <p className="mt-3 text-sm font-medium text-red-600">{passwordError}</p>
                )}

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={savePassword}
                        disabled={savingPassword}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {savingPassword && <Spinner size={16} />}
                        Update Password
                    </button>
                </div>
            </section>
        </div>
    );
}

const inputClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15';

function Field({
    label,
    htmlFor,
    children,
}: {
    label: string;
    htmlFor?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>
            {children}
        </div>
    );
}
