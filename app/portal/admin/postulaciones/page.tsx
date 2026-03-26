import { getPendingApplications } from "@/lib/queries/admin";
import { Card } from "@/components/ui/card";
import { MaterialBadge } from "@/components/shared/material-badge";
import { ApplicationActions } from "./application-actions";

export default async function PostulacionesPage() {
  const applications = await getPendingApplications();

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">
        Postulaciones de Orfebres
      </h1>

      {applications.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay postulaciones pendientes
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="space-y-4">
              <div>
                <h2 className="font-serif text-lg font-medium">{app.name}</h2>
                <p className="text-sm text-text-secondary">{app.email}</p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-text-tertiary">Ubicacion: </span>
                  <span>{app.location}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Especialidad: </span>
                  <span>{app.specialty}</span>
                </div>
                {app.phone && (
                  <div>
                    <span className="text-text-tertiary">Telefono: </span>
                    <span>{app.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-text-secondary">
                  {app.bio.length > 200 ? (
                    <>
                      {app.bio.slice(0, 200)}&hellip;{" "}
                      <span className="text-accent">ver mas</span>
                    </>
                  ) : (
                    app.bio
                  )}
                </p>
              </div>

              {app.materials.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {app.materials.map((m) => (
                    <MaterialBadge key={m} material={m} />
                  ))}
                </div>
              )}

              {app.portfolioImages.length > 0 && (
                <div>
                  <p className="mb-1 text-xs uppercase tracking-widest text-text-tertiary">
                    Portfolio
                  </p>
                  <ul className="space-y-1">
                    {app.portfolioImages.map((url, i) => (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent underline underline-offset-2 hover:text-accent-dark"
                        >
                          {url.length > 60
                            ? `${url.slice(0, 60)}...`
                            : url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <ApplicationActions applicationId={app.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
