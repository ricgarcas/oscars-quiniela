"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { QRCodeSVG } from "qrcode.react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { categories } from "@/lib/categories";
import { scoreSubmission } from "@/lib/scoring";
import { Star4 } from "@/components/RetroStars";

type AdminTab = "submissions" | "winners" | "leaderboard";

function formatSubmittedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const submissions = useQuery(api.submissions.list);
  const winners = useQuery(api.winners.getAll);
  const setWinner = useMutation(api.winners.setWinner);
  const clearWinner = useMutation(api.winners.clearWinner);
  const ensurePublicToken = useMutation(api.submissions.ensurePublicToken);
  const removeSubmission = useMutation(api.submissions.remove);

  const [tab, setTab] = useState<AdminTab>("submissions");
  const [search, setSearch] = useState("");
  const [qrSubmissionId, setQrSubmissionId] = useState<Id<"submissions"> | null>(
    null
  );
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [origin, setOrigin] = useState("");
  const [tokenOverrides, setTokenOverrides] = useState<Record<string, string>>({});
  const [loadingQrFor, setLoadingQrFor] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const leaderboard = useMemo(() => {
    if (!submissions || !winners) {
      return [];
    }

    return submissions
      .map((submission) => {
        const scored = scoreSubmission(submission.picks, winners);

        return {
          id: submission._id,
          name: submission.name,
          score: scored.summary.score,
          total: scored.summary.totalCount,
          resolvedCount: scored.summary.resolvedCount,
          submittedAt: submission.submittedAt,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.name.localeCompare(b.name, "es-MX");
      });
  }, [submissions, winners]);

  const filteredSubmissions = useMemo(() => {
    if (!submissions) {
      return [];
    }

    const normalizedSearch = search.trim().toLocaleLowerCase("es-MX");
    return submissions.filter((submission) =>
      submission.name.toLocaleLowerCase("es-MX").includes(normalizedSearch)
    );
  }, [search, submissions]);

  const tabs = [
    {
      key: "submissions" as const,
      label: `Submissions (${submissions?.length ?? 0})`,
    },
    { key: "winners" as const, label: "Set Winners" },
    { key: "leaderboard" as const, label: "Leaderboard" },
  ];

  const selectedSubmission =
    filteredSubmissions.find((submission) => submission._id === qrSubmissionId) ??
    submissions?.find((submission) => submission._id === qrSubmissionId) ??
    null;

  const selectedToken = selectedSubmission
    ? tokenOverrides[selectedSubmission._id] ?? selectedSubmission.publicToken ?? null
    : null;

  const selectedQrUrl =
    selectedToken && origin ? `${origin}/results/${selectedToken}` : "";

  const openQrModal = async (submissionId: Id<"submissions">) => {
    const submission = submissions?.find((entry) => entry._id === submissionId);
    if (!submission) {
      return;
    }

    setLoadingQrFor(submissionId);

    try {
      if (!submission.publicToken && !tokenOverrides[submissionId]) {
        const result = await ensurePublicToken({ submissionId });
        setTokenOverrides((current) => ({
          ...current,
          [submissionId]: result.publicToken,
        }));
      }
      setQrSubmissionId(submissionId);
    } finally {
      setLoadingQrFor(null);
    }
  };

  const copyQrLink = async () => {
    if (!selectedQrUrl) {
      return;
    }

    await navigator.clipboard.writeText(selectedQrUrl);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1800);
  };

  const handleRemoveSubmission = async (submissionId: Id<"submissions">) => {
    const submission = submissions?.find((entry) => entry._id === submissionId);
    if (!submission) {
      return;
    }

    const shouldDelete = window.confirm(
      `Eliminar la submission de ${submission.name}? Esta acción no se puede deshacer.`
    );

    if (!shouldDelete) {
      return;
    }

    await removeSubmission({ submissionId });

    if (qrSubmissionId === submissionId) {
      setQrSubmissionId(null);
      setCopyState("idle");
    }
  };

  return (
    <div className="min-h-screen">
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

      <nav className="border-b border-gold/20 bg-brown/30">
        <div className="max-w-screen-xl mx-auto px-4 flex gap-1 pt-1 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`admin-tab text-xs uppercase tracking-widest px-6 py-3 min-h-[44px] font-semibold whitespace-nowrap ${
                tab === item.key ? "active" : "text-cream/50 hover:text-cream"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {tab === "submissions" && (
          <div className="space-y-6">
            <div className="teal-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cream/50 mb-2">
                    Búsqueda rápida
                  </p>
                  <h2 className="retro-title text-2xl">Handoff de QR</h2>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre"
                  className="w-full lg:max-w-md bg-cream/95 text-brown border-2 border-cream rounded-xl px-4 py-3 focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/30"
                />
              </div>
            </div>

            {!submissions && (
              <p className="text-sm text-cream/50">Cargando...</p>
            )}

            {submissions?.length === 0 && (
              <p className="text-lg text-cream/50 italic">
                No hay submissions aún.
              </p>
            )}

            {submissions && filteredSubmissions.length === 0 && (
              <div className="teal-card p-6">
                <p className="italic text-cream/60">
                  No encontré a nadie con ese nombre.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {filteredSubmissions.map((submission) => {
                const scored = scoreSubmission(submission.picks, winners ?? {});

                return (
                  <details
                    key={submission._id}
                    className="teal-card overflow-hidden group"
                  >
                    <summary className="cursor-pointer flex flex-col gap-3 px-5 py-4 hover:bg-cream/5 transition-colors duration-200 md:flex-row md:items-center md:justify-between">
                      <div>
                        <span className="retro-title text-xl block">
                          {submission.name}
                        </span>
                        <span className="text-xs uppercase tracking-widest text-cream/50">
                          {Object.keys(submission.picks).length}/{categories.length} ·{" "}
                          {formatSubmittedAt(submission.submittedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex rounded-full bg-brown/20 px-3 py-2 text-xs uppercase tracking-widest text-cream/70">
                          {scored.summary.score} aciertos
                        </span>
                        <span className="inline-flex rounded-full bg-brown/20 px-3 py-2 text-xs uppercase tracking-widest text-cream/70">
                          {scored.summary.resolvedCount} resueltas
                        </span>
                      </div>
                    </summary>

                    <div className="border-t border-cream/10 px-5 py-4 bg-brown/20 space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-cream/40">
                            Link en vivo
                          </p>
                          <p className="text-sm text-cream/70">
                            QR individual para handoff al llegar.
                          </p>
                        </div>
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            openQrModal(submission._id);
                          }}
                          disabled={loadingQrFor === submission._id}
                          className="btn-primary px-5 py-3 min-h-[44px]"
                        >
                          {loadingQrFor === submission._id
                            ? "Preparando QR..."
                            : "Mostrar QR"}
                        </button>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            handleRemoveSubmission(submission._id);
                          }}
                          className="rounded-lg border border-cherry/25 bg-cherry/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cherry transition-colors hover:bg-cherry/20"
                        >
                          Eliminar submission
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {scored.categories.map((category) => (
                          <div
                            key={category.categoryId}
                            className="flex justify-between items-center py-2 px-3 border-b border-cream/5 md:odd:border-r md:odd:border-r-cream/5"
                          >
                            <span className="text-xs text-cream/40 uppercase tracking-wider">
                              {category.categoryName}
                            </span>
                            <span
                              className={`text-sm text-right ml-3 truncate max-w-[52%] ${
                                category.status === "correct"
                                  ? "font-bold text-yellow"
                                  : category.status === "incorrect"
                                    ? "line-through text-cream/30"
                                    : category.status === "unanswered"
                                      ? "italic text-cream/40"
                                      : "text-cream/80"
                              }`}
                            >
                              {category.status === "correct" && "✓ "}
                              {category.pick || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}

        {tab === "winners" && (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="teal-card p-5">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-cream/50 flex items-center gap-2">
                    <Star4 size={8} className="text-gold" />
                    {category.name}
                  </h3>
                  <button
                    onClick={() => clearWinner({ categoryId: category.id })}
                    disabled={!winners?.[category.id]}
                    className="rounded-lg border border-brown/15 bg-brown/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brown transition-colors hover:bg-brown/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Quitar ganador
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.nominees.map((nominee) => {
                    const isWinner = winners?.[category.id] === nominee;
                    return (
                      <button
                        key={nominee}
                        onClick={() =>
                          setWinner({ categoryId: category.id, winner: nominee })
                        }
                        className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px] ${
                          isWinner
                            ? "bg-cherry text-cream border-2 border-yellow shadow-lg shadow-cherry/20"
                            : "bg-cream/10 text-cream/80 border-2 border-transparent hover:bg-cream/20 hover:border-cream/20"
                        }`}
                      >
                        {isWinner && "★ "}
                        {nominee}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

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
              <div className="flex items-center bg-brown/40 px-5 py-3 border-b border-cream/10">
                <span className="text-xs uppercase tracking-widest text-cream/50 w-12">
                  #
                </span>
                <span className="text-xs uppercase tracking-widest text-cream/50 flex-1">
                  Nombre
                </span>
                <span className="text-xs uppercase tracking-widest text-cream/50 w-28 text-right">
                  Puntos
                </span>
              </div>
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center px-5 py-4 border-b border-cream/5 hover:bg-cream/5 transition-colors duration-200"
                >
                  <span
                    className={`font-bold text-lg w-12 ${
                      index === 0
                        ? "text-yellow"
                        : index === 1
                          ? "text-cream/70"
                          : index === 2
                            ? "text-gold/70"
                            : "text-cream/30"
                    }`}
                  >
                    {index === 0 ? "★" : String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="retro-title text-xl flex-1">{entry.name}</span>
                  <span className="font-bold text-lg w-28 text-right text-cream">
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

      {selectedSubmission && selectedQrUrl && (
        <div className="fixed inset-0 z-50 bg-brown/70 backdrop-blur-sm px-4 py-8">
          <div className="max-w-xl mx-auto teal-card p-6 md:p-8 relative">
            <button
              onClick={() => {
                setQrSubmissionId(null);
                setCopyState("idle");
              }}
              className="absolute right-4 top-4 text-brown/60 hover:text-brown text-2xl leading-none"
              aria-label="Cerrar QR"
            >
              ×
            </button>

            <p className="text-xs uppercase tracking-[0.3em] text-brown/60 mb-2">
              QR de llegada
            </p>
            <h2 className="retro-title text-4xl text-brown mb-6">
              {selectedSubmission.name}
            </h2>

            <div className="bg-white rounded-3xl p-5 flex items-center justify-center">
              <QRCodeSVG
                value={selectedQrUrl}
                size={320}
                bgColor="#FFFFFF"
                fgColor="#111111"
                includeMargin
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={copyQrLink}
                className="btn-primary px-5 py-3 min-h-[44px] flex-1"
              >
                {copyState === "copied" ? "Link copiado" : "Copiar link"}
              </button>
              <a
                href={selectedQrUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-brown/10 hover:bg-brown/20 text-brown px-5 py-3 rounded-xl transition-colors min-h-[44px] flex-1 inline-flex items-center justify-center font-semibold"
              >
                Abrir página en vivo
              </a>
            </div>
          </div>
        </div>
      )}

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
