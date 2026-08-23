"use client";

import { TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <Container size="sm" className="py-16 sm:py-24">
      <Card padding="lg" className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--error-bg)] text-[var(--error)]">
          <TriangleAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl">
            No pudimos cargar esta página
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Ocurrió un error inesperado. Tus datos no se enviaron ni se guardaron.
          </p>
        </div>
        <Button onClick={reset}>Intentar de nuevo</Button>
      </Card>
    </Container>
  );
}
