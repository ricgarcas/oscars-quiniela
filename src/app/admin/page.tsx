"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { categories } from "@/lib/categories";
import { useState } from "react";
import { Star4 } from "@/components/RetroStars";

export default function AdminPage() {
  const submissions = useQuery(api.submissions.list);
  const winners = useQuery(api.winners.getAll);
  const setWinner = useMutation(api.winners.setWinner);
  const [tab, setTab] = useState<"submissions" | "winners" | "leaderboard">(
    "submissions"
  );

  const leaderboard =
    submissions && winners
      ? submissions
          .map((s) => {
            let score = 0;
            for (const cat of categories) {
              if (s.picks[cat.id] && s.picks[cat.id] === winners[cat.id]) {
                score++;
              }
            }
            return { name: s.name, score, total: Object.keys(s.picks).length };
          })
          .sort((a, b) => b.score - a.score)
      : [];

  const tabs = [
    { key: "submissions" as const, label: `Submissions (${submissions?.length ?? 0})` },
    { key: "winners" as const, label: "Set Winners" },
    { key: "leaderboard" as const, label: "Leaderboard" },
  ];

  return (
    <div className="min-h-screen">
      {/* Film strip */}
      <div className="film-strip" />

      {/* Masthead */}
      <header className="border-b border-gold/20 bg-brown/50">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cream/50 mb-1 flex items-center gap-2">
            <Star4 size={8} className="text-gold" />
            Panel de Administración
          </p>
          <h1 className="retro-title text-4xl md:text-5xl">
            Quiniela Oscars 2026
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-gold/20 bg-brown/30">
        <div className="max-w-screen-xl mx-auto px-4 flex gap-1 pt-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`admin-tab text-xs uppercase tracking-widest px-6 py-3 min-h-[44px] font-semibold ${
                tab === t.key
                  ? "active"
                  : "text-cream/50 hover:text-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Submissions Tab */}
        {tab === "submissions" && (
          <div>
            {!submissions && (
              <p className="text-sm text-cream/50">Cargando...</p>
            )}
            {submissions?.length === 0 && (
              <p className="text-lg text-cream/50 italic">
                No hay submissions aún.
              </p>
            )}
            <div className="space-y-2">
              {submissions?.map((s) => (
                <details
                  key={s._id}
                  className="teal-card overflow-hidden group"
                >
                  <summary className="cursor-pointer flex justify-between items-center px-5 py-4 hover:bg-cream/5 transition-colors duration-200">
                    <span className="retro-title text-xl">
                      {s.name}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-cream/50">
                      {Object.keys(s.picks).length}/{categories.length} ·{" "}
                      {new Date(s.submittedAt).toLocaleString("es-MX", {
                        timeZone: "America/Mexico_City",
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </summary>
                  <div className="border-t border-cream/10 px-5 py-4 bg-brown/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      {categories.map((cat) => {
                        const pick = s.picks[cat.id];
                        const winner = winners?.[cat.id];
                        const isCorrect = winner && pick === winner;
                        const isWrong = winner && pick && pick !== winner;
                        return (
                          <div
                            key={cat.id}
                            className="flex justify-between items-center py-2 px-3 border-b border-cream/5 md:odd:border-r md:odd:border-r-cream/5"
                          >
                            <span className="text-xs text-cream/40 uppercase tracking-wider">
                              {cat.name}
                            </span>
                            <span
                              className={`text-sm text-right ml-3 truncate max-w-[50%] ${
                                isCorrect
                                  ? "font-bold text-yellow"
                                  : isWrong
                                    ? "line-through text-cream/30"
                                    : "text-cream/80"
                              }`}
                            >
                              {isCorrect && "✓ "}
                              {pick || "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Set Winners Tab */}
        {tab === "winners" && (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="teal-card p-5">
                <h3 className="text-xs uppercase tracking-widest text-cream/50 mb-3 flex items-center gap-2">
                  <Star4 size={8} className="text-gold" />
                  {cat.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.nominees.map((n) => {
                    const isWinner = winners?.[cat.id] === n;
                    return (
                      <button
                        key={n}
                        onClick={() =>
                          setWinner({ categoryId: cat.id, winner: n })
                        }
                        className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px] ${
                          isWinner
                            ? "bg-cherry text-cream border-2 border-yellow shadow-lg shadow-cherry/20"
                            : "bg-cream/10 text-cream/80 border-2 border-transparent hover:bg-cream/20 hover:border-cream/20"
                        }`}
                      >
                        {isWinner && "★ "}{n}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {tab === "leaderboard" && (
          <div>
            {Object.keys(winners ?? {}).length === 0 && (
              <div className="teal-card p-6 mb-6">
                <p className="text-cream/70 italic">
                  Primero marca los ganadores en &quot;Set Winners&quot;.
                </p>
              </div>
            )}

            <div className="teal-card overflow-hidden">
              {/* Table header */}
              <div className="flex items-center bg-brown/40 px-5 py-3 border-b border-cream/10">
                <span className="text-xs uppercase tracking-widest text-cream/50 w-12">#</span>
                <span className="text-xs uppercase tracking-widest text-cream/50 flex-1">Nombre</span>
                <span className="text-xs uppercase tracking-widest text-cream/50 w-24 text-right">Puntos</span>
              </div>
              {leaderboard.map((entry, i) => (
                <div
                  key={`${entry.name}-${i}`}
                  className="flex items-center px-5 py-4 border-b border-cream/5 hover:bg-cream/5 transition-colors duration-200"
                >
                  <span className={`font-bold text-lg w-12 ${
                    i === 0 ? "text-yellow" : i === 1 ? "text-cream/70" : i === 2 ? "text-gold/70" : "text-cream/30"
                  }`}>
                    {i === 0 ? "★" : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="retro-title text-xl flex-1">
                    {entry.name}
                  </span>
                  <span className="font-bold text-lg w-24 text-right text-cream">
                    {entry.score}
                    <span className="text-cream/30 text-sm">/{entry.total}</span>
                  </span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <p className="italic text-cream/50">Sin participantes aún.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gold/20 mt-16 py-4 text-center">
        <p className="text-xs uppercase tracking-widest text-cream/30 flex items-center justify-center gap-2">
          <Star4 size={8} className="text-gold/30" />
          Oscars 2026 · Live Sunday March 15
          <Star4 size={8} className="text-gold/30" />
        </p>
      </footer>
    </div>
  );
}
