import { AuthShell } from '@/components/shared/auth-shell';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password" description="Send a password reset link to your email address.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
