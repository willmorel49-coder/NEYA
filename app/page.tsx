export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-5xl font-semibold tracking-tight">NEYA</h1>
      <p className="mt-4 text-lg text-neutral-700">
        Reconnaître, nommer, réguler &mdash; un geste à la fois.
      </p>
      <p className="mt-12 text-sm text-neutral-500">
        Projet en amorçage. Voir{" "}
        <a
          className="underline underline-offset-4 hover:text-neutral-900"
          href="https://github.com/willmorel49-coder/NEYA"
        >
          le dépôt GitHub
        </a>
        .
      </p>
    </main>
  );
}
