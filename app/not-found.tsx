import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container size="sm" className="py-16 sm:py-24">
      <Card padding="lg" className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
          <SearchX className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--primary)]">Error 404</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] sm:text-3xl">
            Página no encontrada
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            La dirección no existe o el recurso todavía no está publicado.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonStyles({ variant: "outline" })}>
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </Link>
          <Link href="/tools" className={buttonStyles()}>
            Ver herramientas
          </Link>
        </div>
      </Card>
    </Container>
  );
}
