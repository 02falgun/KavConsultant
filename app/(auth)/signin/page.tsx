import { AuthShell } from '@/components/shared/auth-shell';
import { SignInForm } from '@/features/auth/components/sign-in-form';

export default function SignInPage() {
  return (
    <AuthShell title="Sign in" description="Access your tenant workspace securely with email and password or magic link.">
      <SignInForm />
    </AuthShell>
  );
}
