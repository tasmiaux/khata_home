export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ googleError?: string; name?: string }>;
}) {
  const { googleError, name } = await searchParams;
  const duplicateName = googleError === "duplicate" ? name : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-8">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl text-foreground">Create your khata</h1>
          <p className="text-[15px] text-muted">
            Every home keeps a khata. Let&apos;s set up yours.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {duplicateName && (
          <p className="text-sm text-red-700">
            A profile named &apos;{duplicateName}&apos; already exists. Log in instead, or use a
            different Google account.
          </p>
        )}

        <a
          href="/api/auth/google"
          className="rounded-full bg-accent px-4 py-2.5 text-center font-medium text-background transition-colors hover:bg-accent/90"
        >
          Sign up with Google
        </a>
      </div>
    </main>
  );
}
