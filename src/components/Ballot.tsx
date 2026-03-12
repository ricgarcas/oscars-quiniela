"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { categories } from "@/lib/categories";
import { motion, AnimatePresence } from "framer-motion";
import { Star4, RetroSparkles } from "./RetroStars";
import Mascots from "./Mascots";

export default function Ballot() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const submit = useMutation(api.submissions.submit);
  const deadline = useQuery(api.submissions.getDeadline);

  const totalSteps = categories.length + 2;
  const isExpired = deadline ? Date.now() > deadline : false;

  const handlePick = useCallback((categoryId: string, nominee: string) => {
    setPicks((p) => ({ ...p, [categoryId]: nominee }));
    setTimeout(() => setStep((s) => s + 1), 350);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await submit({ name, picks });
      setSubmittedToken(result.publicToken);
      setStep(totalSteps);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (step === 0 && e.key === "Enter" && name.trim()) {
        setStep(1);
      }
    },
    [step, name]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const resultUrl =
    submittedToken && typeof window !== "undefined"
      ? `${window.location.origin}/results/${submittedToken}`
      : "";

  const copyResultUrl = useCallback(async () => {
    if (!resultUrl) {
      return;
    }
    await navigator.clipboard.writeText(resultUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [resultUrl]);

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 star-field">
        <div className="text-center">
          <h1 className="retro-title text-5xl md:text-7xl mb-6">
            Predicciones Cerradas
          </h1>
          <p className="text-lg text-cream/70 italic">
            ¡Disfruta la ceremonia!
          </p>
        </div>
      </div>
    );
  }

  const progress = Math.round((step / (totalSteps - 1)) * 100);

  return (
    <div className="min-h-screen flex flex-col star-field">
      {step > 0 && step <= categories.length && <Mascots step={step} nomineeCount={categories[step - 1].nominees.length} />}


      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[4px] bg-brown-light/50 z-50">
        <motion.div
          className="h-full bg-cherry"
          style={{ boxShadow: "0 0 10px rgba(212,43,43,0.5)" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>



      {/* Top nav bar */}
      {step > 0 && step < totalSteps && (
        <div className="fixed top-[4px] left-0 right-0 z-40 bg-teal-dark/95 backdrop-blur-sm border-b border-cream/10">
          <div className="max-w-screen-xl mx-auto px-4 py-1 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="bg-cream/15 hover:bg-cream/25 text-cream rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
              aria-label="Anterior"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <span className="font-retro text-base text-cream flex items-center gap-2">
              <Star4 size={10} className="text-yellow" />
              {step <= categories.length
                ? `${step} de ${categories.length}`
                : "Revisión"}
              <Star4 size={10} className="text-yellow" />
            </span>

            {step <= categories.length && picks[categories[step - 1]?.id] ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="bg-cream/15 hover:bg-cream/25 text-cream rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
                aria-label="Siguiente"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>
      )}

      <div className={`flex-1 flex justify-center px-4 ${step === 0 || step === totalSteps ? "items-center py-24" : "items-start pt-16 pb-24"}`}>
        <AnimatePresence mode="wait">
          {/* Step 0: Name */}
          {step === 0 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-2xl text-center"
            >
              <div className="marquee-border p-8 md:p-12 teal-card">
                {/* Masthead */}
                <div className="mb-2">
                  <div className="flex items-center gap-3 justify-center mb-6">
                    <div className="h-px flex-1 max-w-16 bg-cherry/30" />
                    <p className="font-retro text-base text-cherry">
                      15 de Marzo, 2026 · 5:00 PM · Casa Maggie
                    </p>
                    <div className="h-px flex-1 max-w-16 bg-cherry/30" />
                  </div>
                  <h1 className="retro-title text-4xl sm:text-5xl lg:text-7xl leading-[1.1] mb-2">
                    Quiniela de
                  </h1>
                  <h1 className="retro-title-red text-5xl sm:text-6xl lg:text-8xl leading-[1]">
                    los Oscars
                  </h1>
                </div>

                <RetroSparkles />

                <div className="my-8">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-sm mx-auto block bg-cream/95 text-brown border-2 border-cream rounded-xl px-4 py-3 text-xl text-center focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/30 transition-all duration-200 placeholder:text-brown/30"
                    autoFocus
                  />
                </div>

                <button
                  onClick={() => name.trim() && setStep(1)}
                  disabled={!name.trim()}
                  className="btn-primary text-lg px-10 py-4 min-h-[44px]"
                >
                  ★ Empezar ★
                </button>
              </div>
            </motion.div>
          )}

          {/* Category steps */}
          {step >= 1 && step <= categories.length && (
            <motion.div
              key={`cat-${step}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-widest mb-3">
                  <Star4 size={10} />
                  Categoría {step}
                  <Star4 size={10} />
                </span>
                <h2 className="retro-title text-3xl md:text-4xl lg:text-5xl leading-[1.1]">
                  {categories[step - 1].name}
                </h2>
              </div>

              <div className={`grid gap-3 ${categories[step - 1].nominees.length > 5 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {categories[step - 1].nominees.map((nominee, i) => {
                  const isSelected = picks[categories[step - 1].id] === nominee;
                  return (
                    <button
                      key={nominee}
                      onClick={() => handlePick(categories[step - 1].id, nominee)}
                      className={`nominee-btn w-full text-left px-5 py-4 flex items-start gap-4 min-h-[44px] ${
                        isSelected ? "selected" : ""
                      }`}
                    >
                      <span className={`font-bold text-sm mt-0.5 ${isSelected ? "text-yellow" : "text-brown/40"}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-base md:text-lg leading-snug">
                        {nominee}
                      </span>
                      {isSelected && (
                        <Star4 size={14} className="text-yellow ml-auto mt-1 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Review step */}
          {step === categories.length + 1 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-8">
                <h2 className="retro-title text-4xl md:text-5xl mb-2">
                  Tus Predicciones
                </h2>
                <p className="text-xs uppercase tracking-widest text-cream/50">
                  {Object.keys(picks).length} de {categories.length} categorías
                </p>
              </div>

              <div className="teal-card rounded-2xl overflow-hidden">
                <div className="max-h-[55vh] overflow-y-auto">
                  {categories.map((cat, i) => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center py-3 px-5 border-b border-cream/10 hover:bg-cream/5 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-cream/30 w-6 font-bold">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm text-cream/70">
                          {cat.name}
                        </span>
                      </div>
                      {picks[cat.id] ? (
                        <span className="text-sm font-semibold truncate ml-4 max-w-[45%] text-right text-cream">
                          {picks[cat.id]}
                        </span>
                      ) : (
                        <button
                          onClick={() => setStep(i + 1)}
                          className="text-xs uppercase tracking-widest text-yellow hover:text-cherry transition-colors"
                        >
                          Contestar →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-cherry text-sm text-center mt-4 border border-cherry rounded-xl px-4 py-2 bg-cherry/10">
                  {error}
                </p>
              )}

              <div className="text-center mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary text-lg px-12 py-4 min-h-[44px]"
                >
                  {submitting ? "Enviando..." : "★ Enviar predicciones ★"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Done */}
          {step === totalSteps && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-lg"
            >
              <div className="marquee-border p-8 md:p-12 teal-card">
                <span className="text-xs uppercase tracking-widest text-cream/50 mb-4 block">
                  ★ Confirmación ★
                </span>
                <h2 className="retro-title text-4xl md:text-5xl mb-2">
                  Listo,
                </h2>
                <h2 className="retro-title-red text-5xl md:text-6xl mb-6">
                  {name}!
                </h2>
                <RetroSparkles />
                <p className="text-lg text-cream/70 italic leading-relaxed mt-6">
                  Tus predicciones están registradas.<br />
                  Usa tu link personal para seguir tus aciertos en vivo.
                </p>
                {resultUrl && (
                  <div className="mt-8 rounded-2xl border border-cream/15 bg-brown/20 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-cream/50 mb-3">
                      Tu página en vivo
                    </p>
                    <p className="text-sm text-cream break-all">
                      {resultUrl}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={copyResultUrl}
                        className="btn-primary px-6 py-3 min-h-[44px]"
                      >
                        {copied ? "Link copiado" : "Copiar link"}
                      </button>
                      <a
                        href={resultUrl}
                        className="bg-cream/10 hover:bg-cream/20 text-cream px-6 py-3 rounded-xl transition-colors min-h-[44px] inline-flex items-center justify-center"
                      >
                        Ver resultados en vivo
                      </a>
                    </div>
                  </div>
                )}
                <div className="mt-8">
                  <RetroSparkles />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  );
}
