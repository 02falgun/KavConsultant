import { AuthShell } from '@/components/shared/auth-shell';
import { SignUpForm } from '@/features/auth/components/sign-up-form';

export default function SignUpPage() {
  return (
    <AuthShell title="Create workspace" description="Start a new tenant workspace and become its first ADMIN.">
      <SignUpForm />
    </AuthShell>
  );
}
