import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { AuthForm } from "./AuthForm";

export const metadata = { title: "Connexion — Postulia" };

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <div className="aurora" />
      <div className="rainbow fixed inset-x-0 top-0 z-50 h-[3px]" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
        <div className="mb-8 flex justify-center">
          <div className="glass rounded-full px-4 py-2">
            <Logo />
          </div>
        </div>
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
