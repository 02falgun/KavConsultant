import { AuthShell } from '@/components/shared/auth-shell';
import { AcceptInviteForm } from '@/features/auth/components/accept-invite-form';

export default function AcceptInvitePage() {
  return (
    <AuthShell title="Accept invitation" description="Join your workspace by accepting the invitation sent to your email.">
      <AcceptInviteForm />
    </AuthShell>
  );
}
