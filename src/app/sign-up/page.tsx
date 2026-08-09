import { AuthForm } from "@/features/auth/auth-form";
import { signUpWithPassword } from "@/actions/auth";

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <AuthForm mode="sign-up" action={signUpWithPassword} />
    </main>
  );
}
