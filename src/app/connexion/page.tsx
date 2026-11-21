import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { AuthForm } from "./AuthForm";

export const metadata = { title: "Connexion — Postulia" };

export default function Page() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
