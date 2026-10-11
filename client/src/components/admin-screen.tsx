"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw, ShieldCheck, Users } from "lucide-react";
import { adminApi } from "@/api/admin";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminScreen() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: adminApi.overview,
    retry: false,
  });
  const users = useQuery({
    queryKey: ["admin", "users", { search, role, page, pageSize }],
    queryFn: () => adminApi.users({ search, role, page, pageSize }),
    retry: false,
  });
  const stats = overview.data;
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ShieldCheck aria-hidden />
          Administration
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vue globale des comptes et de l’utilisation. Accès réservé aux
          administrateurs, en lecture seule.
        </p>
      </header>
      {showQuerySkeleton(overview) ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : overview.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger les indicateurs."
        >
          <Button variant="outline" onClick={() => void overview.refetch()}>
            Réessayer
          </Button>
        </FeedbackState>
      ) : (
        stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Utilisateurs inscrits", stats.users],
              ["Inscriptions sur 30 jours", stats.newUsers],
              ["Rappels activés", stats.notificationsEnabled],
              ["Tâches créées", stats.tasks],
              ["Tâches terminées", stats.completedTasks],
              ["Rappels en échec", stats.failedReminders],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        )
      )}
      <section
        className="space-y-4 rounded-xl border bg-card p-4 sm:p-5"
        aria-labelledby="admin-users-title"
      >
        <h2
          id="admin-users-title"
          className="flex items-center gap-2 font-semibold"
        >
          <Users className="size-5" aria-hidden />
          Utilisateurs
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor="admin-search" className="mb-2 block text-sm">
              Rechercher
            </label>
            <Input
              id="admin-search"
              placeholder="Nom, prénom ou email…"
              maxLength={100}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label htmlFor="admin-role" className="mb-2 block text-sm">
              Rôle
            </label>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value);
                setPage(1);
              }}
            >
              <SelectTrigger id="admin-role" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(search || role !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setRole("all");
                setPage(1);
              }}
            >
              <RotateCcw aria-hidden />
              Réinitialiser
            </Button>
          )}
        </div>
        {showQuerySkeleton(users) ? (
          <div className="space-y-3" aria-label="Chargement des utilisateurs">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : users.isError ? (
          <FeedbackState
            variant="error"
            description="Impossible de charger les utilisateurs. Vérifie ton accès administrateur."
          >
            <Button variant="outline" onClick={() => void users.refetch()}>
              Réessayer
            </Button>
          </FeedbackState>
        ) : !users.data?.items.length ? (
          <FeedbackState
            icon={Users}
            description="Aucun utilisateur ne correspond aux filtres."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {[
                      "Utilisateur",
                      "Rôle",
                      "Inscription",
                      "Fuseau horaire",
                      "Tâches / terminées",
                      "Rappels",
                      "Résumé matinal",
                    ].map((label) => (
                      <th
                        className="px-3 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                        key={label}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.data.items.map((user) => (
                    <tr className="border-b" key={user.id}>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-medium">
                          {[user.firstName, user.lastName]
                            .filter(Boolean)
                            .join(" ") || "Nom non renseigné"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium">
                          {user.role === "admin"
                            ? "Administrateur"
                            : "Utilisateur"}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {new Intl.DateTimeFormat("fr", {
                          timeZone: "UTC",
                        }).format(new Date(user.createdAt))}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {user.timezone}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {user.tasks} / {user.completedTasks}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {user.notificationsEnabled ? "Activés" : "Désactivés"}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {user.dailyDigestEnabled ? "Activé" : "Désactivé"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DataPagination
              page={page}
              pageSize={pageSize}
              total={users.data.total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
        <p className="text-xs text-muted-foreground">
          Les chiffres couvrent toute la période. Aucun titre, description,
          note, numéro de téléphone ou secret de connexion n’est exposé ici.
        </p>
      </section>
    </div>
  );
}
