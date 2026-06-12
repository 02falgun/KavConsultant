import { AuthShell } from '@/components/shared/auth-shell';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Reset password" description="Set a new password for your KavConsultant account.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
