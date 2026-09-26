import { Link } from "@tanstack/react-router";
import { CompassIcon } from "lucide-react";

export function AppNotFoundComponent() {
  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-zinc-400" aria-hidden="true">
        <CompassIcon className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Página não encontrada</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">Esse endereço não existe.</p>
      <Link to="/" className="text-sm underline underline-offset-4">
        Voltar ao jogo
      </Link>
    </main>
  );
}
