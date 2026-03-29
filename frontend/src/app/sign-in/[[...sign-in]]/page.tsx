import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-transparent px-4 py-16">
      <SignIn path="/sign-in" routing="path" signUpUrl="/" />
    </main>
  );
}
