import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10 px-5 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl text-foreground">Your household, your ledger.</h1>
        <p className="text-[15px] text-muted">Track cash and UPI spending, the simple way.</p>
      </header>

      <div className="flex flex-col gap-3">
        <Link
          href="/register"
          className="bg-accent px-4 py-2.5 text-center font-medium text-background transition-colors hover:bg-accent/90"
        >
          Create your khata
        </Link>
        <Link
          href="/login"
          className="border border-border px-4 py-2.5 text-center font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Log in
        </Link>
      </div>

      <p className="label-stamp text-center text-xs text-muted uppercase">
        No bank linking. Your data stays with you.
      </p>
    </main>
  );
}
