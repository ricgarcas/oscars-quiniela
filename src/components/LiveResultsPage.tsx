"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { scoreSubmission } from "@/lib/scoring";
import { Star4 } from "@/components/RetroStars";

function formatSubmittedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: "pending" | "correct" | "incorrect" | "unanswered") {
  switch (status) {
    case "correct":
      return "Acertaste";
    case "incorrect":
      return "Fallaste";
    case "unanswered":
      return "Sin respuesta";
    default:
      return "Pendiente";
  }
}

function statusClasses(status: "pending" | "correct" | "incorrect" | "unanswered") {
  switch (status) {
    case "correct":
      return "border-yellow bg-yellow/20 text-brown";
    case "incorrect":
      return "border-cherry bg-cherry/15 text-cream";
    case "unanswered":
      return "border-cream/15 bg-brown/20 text-cream/50";
    default:
      return "border-cream/20 bg-cream/10 text-cream";
  }
}

export default function LiveResultsPage({ token }: { token: string }) {
  const submission = useQuery(api.submissions.getByPublicToken, { token });
  const winners = useQuery(api.winners.getAll);

  const scored = useMemo(() => {
    if (!submission) {
      return null;
    }
    return scoreSubmission(submission.picks, winners ?? {});
  }, [submission, winners]);

  if (submission === undefined || winners === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 star-field">
        <p className="text-sm uppercase tracking-[0.3em] text-cream/50">
          Cargando resultados...
        </p>
      </div>
    );
  }

  if (submission === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 star-field">
        <div className="max-w-lg text-center teal-card p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cream/50 mb-3">
            Resultado no encontrado
          </p>
          <h1 className="retro-title text-4xl mb-4">Ups...</h1>
          <p className="text-cream/70 italic">
            Este link ya no existe o no corresponde a una quiniela registrada.
          </p>
        </div>
      </div>
    );
  }

  if (!scored) {
    return null;
  }

  return (
    <div className="min-h-screen star-field">
      <header className="border-b border-gold/20 bg-brown/50">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <p className="text-xs uppercase tracking-[0.3em] text-cream/50 mb-2 flex items-center gap-2">
            <Star4 size={8} className="text-gold" />
            Resultados en Vivo
          </p>
          <h1 className="retro-title text-4xl md:text-5xl">
            {submission.name}
          </h1>
          <p className="text-sm text-cream/60 mt-3">
            Enviada el {formatSubmittedAt(submission.submittedAt)}
          </p>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="teal-card p-5">
            <p className="text-xs uppercase tracking-widest text-cream/50 mb-2">
              Puntaje
            </p>
            <p className="retro-title text-4xl">
              {scored.summary.score}
              <span className="text-xl text-cream/50">
                /{scored.summary.totalCount}
              </span>
            </p>
          </div>
          <div className="teal-card p-5">
            <p className="text-xs uppercase tracking-widest text-cream/50 mb-2">
              Categorías resueltas
            </p>
            <p className="retro-title text-4xl">
              {scored.summary.resolvedCount}
            </p>
          </div>
          <div className="teal-card p-5">
            <p className="text-xs uppercase tracking-widest text-cream/50 mb-2">
              Faltan por anunciar
            </p>
            <p className="retro-title text-4xl">
              {scored.summary.remainingCount}
            </p>
          </div>
        </section>

        <section className="teal-card overflow-hidden">
          <div className="border-b border-cream/10 bg-brown/20 px-5 py-4">
            <h2 className="retro-title text-2xl">Tus Predicciones</h2>
          </div>

          <div className="divide-y divide-cream/10">
            {scored.categories.map((category, index) => (
              <div
                key={category.categoryId}
                className="px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-cream/40 mb-1">
                    {String(index + 1).padStart(2, "0")} · {category.categoryName}
                  </p>
                  <p className="text-lg text-cream font-semibold truncate">
                    {category.pick || "Sin respuesta"}
                  </p>
                  {category.winner && (
                    <p className="text-sm text-cream/50 mt-1">
                      Ganador actual: {category.winner}
                    </p>
                  )}
                </div>

                <span
                  className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold ${statusClasses(
                    category.status
                  )}`}
                >
                  {statusLabel(category.status)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
