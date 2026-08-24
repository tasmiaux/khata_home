import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-baseline gap-0.5 font-hand text-2xl leading-none">
          <span className="text-accent">खा</span>
          <span className="text-foreground">ta</span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl text-foreground">Welcome back to your khata</h1>
          <p className="text-[15px] text-muted">Pick up right where you left off.</p>
        </div>
      </header>

      <a
        href="/api/auth/google"
        className="bg-accent px-4 py-2.5 text-center font-medium text-background transition-colors hover:bg-accent/90"
      >
        Continue with Google
      </a>

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="text-accent underline underline-offset-2">
          Create your khata
        </Link>
      </p>
    </main>
  );
}
