import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10 px-5 py-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-baseline gap-0.5 font-hand text-2xl leading-none">
          <span className="text-accent">खा</span>
          <span className="text-foreground">ta</span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl text-foreground">Your household, your ledger.</h1>
          <p className="text-[15px] text-muted">Track cash and UPI spending, the simple way.</p>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <Link
          href="/register"
          className="rounded-full bg-accent px-4 py-2.5 text-center font-medium text-background transition-colors hover:bg-accent/90"
        >
          Create your khata
        </Link>
        <a
          href="/api/auth/google"
          className="rounded-full border border-border px-4 py-2.5 text-center font-medium text-foreground transition-colors hover:bg-accent-soft"
        >
          Log in
        </a>
      </div>

      <p className="label-stamp text-center text-xs text-muted uppercase">
        No bank linking. Your data stays with you.
      </p>
    </main>
  );
}
