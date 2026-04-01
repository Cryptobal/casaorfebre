import Image from "next/image";
import { getPendingApplications } from "@/lib/queries/admin";
import { Card } from "@/components/ui/card";
import { MaterialBadge } from "@/components/shared/material-badge";
import { ApplicationActions } from "./application-actions";

const PLAN_LABELS: Record<string, string> = {
  esencial: "Esencial",
  artesano: "Artesano",
  maestro: "Maestro",
};

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "—", last: "—" };
  if (parts.length === 1) return { first: parts[0], last: "—" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export default async function PostulacionesPage() {
  const applications = await getPendingApplications();

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Postulaciones de Orfebres</h1>

      {applications.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay postulaciones pendientes
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {applications.map((app) => {
            const { first, last } = splitName(app.name);
            const planLabel = app.selectedPlan
              ? PLAN_LABELS[app.selectedPlan] || app.selectedPlan
              : null;

            return (
              <Card key={app.id} className="space-y-4 p-4 sm:p-6">
                <div className="flex flex-col gap-1 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-medium">{app.name}</h2>
                    <p className="text-sm text-text-secondary">{app.email}</p>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    Recibida: {new Date(app.createdAt).toLocaleString("es-CL")}
                  </p>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-text-tertiary">Nombre</span>
                    <p className="font-medium">{first}</p>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Apellido</span>
                    <p className="font-medium">{last}</p>
                  </div>
                  {app.region && (
                    <div>
                      <span className="text-text-tertiary">Región</span>
                      <p>{app.region}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-text-tertiary">Ciudad</span>
                    <p>{app.location}</p>
                  </div>
                  {app.phone && (
                    <div>
                      <span className="text-text-tertiary">Teléfono</span>
                      <p>{app.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-text-tertiary">Especialidad</span>
                    <p>{app.specialty}</p>
                  </div>
                  {planLabel && (
                    <div>
                      <span className="text-text-tertiary">Plan elegido</span>
                      <p>{planLabel}</p>
                    </div>
                  )}
                  {app.yearsExperience != null && (
                    <div>
                      <span className="text-text-tertiary">Años de experiencia</span>
                      <p>
                        {app.yearsExperience} {app.yearsExperience === 1 ? "año" : "años"}
                      </p>
                    </div>
                  )}
                </div>

                {app.categories.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-widest text-text-tertiary">
                      Categorías de piezas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.categories.map((c) => (
                        <span
                          key={c}
                          className="inline-block rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {app.experience && (
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-widest text-text-tertiary">
                      Experiencia (texto libre)
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-text-secondary">{app.experience}</p>
                  </div>
                )}

                <div>
                  <p className="mb-1 text-xs uppercase tracking-widest text-text-tertiary">
                    Sobre ti / bio
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-text-secondary">{app.bio}</p>
                </div>

                {app.awards.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-widest text-text-tertiary">
                      Premios y reconocimientos
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.awards.map((award: string) => (
                        <span
                          key={award}
                          className="inline-block rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent"
                        >
                          {award}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {app.portfolioUrl && (
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-widest text-text-tertiary">
                      Portafolio / web
                    </p>
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent underline underline-offset-2 hover:text-accent-dark"
                    >
                      {app.portfolioUrl}
                    </a>
                  </div>
                )}

                {app.materials.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-widest text-text-tertiary">
                      Materiales
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.materials.map((m) => (
                        <MaterialBadge key={m} material={m} />
                      ))}
                    </div>
                  </div>
                )}

                {app.portfolioImages.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-widest text-text-tertiary">
                      Fotos enviadas
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {app.portfolioImages.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative aspect-square overflow-hidden rounded-md border border-border bg-background"
                        >
                          <Image
                            src={url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 200px"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Review */}
                {(app as unknown as { aiReview: { qualityScore: number; originalityScore: number; diversityScore: number; overallRecommendation: string; summary: string; strengths: string[]; concerns: string[] } | null }).aiReview && (() => {
                  const review = (app as unknown as { aiReview: { qualityScore: number; originalityScore: number; diversityScore: number; overallRecommendation: string; summary: string; strengths: string[]; concerns: string[] } }).aiReview;
                  return (
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="mb-3 text-xs uppercase tracking-widest text-text-tertiary">
                        Analisis IA del portfolio
                      </p>

                      {/* Recommendation badge */}
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            review.overallRecommendation === "APPROVE"
                              ? "bg-green-100 text-green-800"
                              : review.overallRecommendation === "REJECT"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {review.overallRecommendation === "APPROVE"
                            ? "Recomendar aprobación"
                            : review.overallRecommendation === "REJECT"
                              ? "Recomendar rechazo"
                              : "Requiere revisión manual"}
                        </span>
                      </div>

                      {/* Score bars */}
                      <div className="mb-3 grid grid-cols-3 gap-3">
                        {[
                          { label: "Calidad", score: review.qualityScore },
                          { label: "Originalidad", score: review.originalityScore },
                          { label: "Diversidad", score: review.diversityScore },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-secondary">{item.label}</span>
                              <span className="font-medium text-text">{item.score}/10</span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-border">
                              <div
                                className="h-1.5 rounded-full bg-accent transition-all"
                                style={{ width: `${(item.score / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-text-secondary">{review.summary}</p>

                      {/* Strengths & Concerns */}
                      {review.strengths.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-green-700">Fortalezas:</p>
                          <ul className="mt-0.5 space-y-0.5">
                            {review.strengths.map((s, i) => (
                              <li key={i} className="text-xs text-text-secondary">+ {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {review.concerns.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-amber-700">Observaciones:</p>
                          <ul className="mt-0.5 space-y-0.5">
                            {review.concerns.map((c, i) => (
                              <li key={i} className="text-xs text-text-secondary">• {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="border-t border-border pt-4">
                  <ApplicationActions applicationId={app.id} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
