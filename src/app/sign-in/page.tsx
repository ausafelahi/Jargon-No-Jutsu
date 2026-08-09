import { AuthForm } from "@/features/auth/auth-form";
import { signInWithPassword } from "@/actions/auth";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <AuthForm mode="sign-in" action={signInWithPassword} />
    </main>
  );
}
