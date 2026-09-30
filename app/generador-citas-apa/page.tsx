import ToolPage from "@/components/tools/ToolPage";
import CitationForm from "@/components/tools/citations/CitationForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("generador-citas-apa");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/generador-citas-apa",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="generador-citas-apa"
      intro="Genera referencias bibliográficas en formato APA 7.ª edición (versión en español) para libros, artículos de revistas científicas, páginas web y tesis, junto con la cita dentro del texto."
      howTo={["Elige el tipo de fuente.", "Agrega los autores con apellidos y nombres, o el nombre de la institución.", "Completa el año, el título y los datos del tipo de fuente (editorial, revista, sitio o universidad).", "Copia la referencia para tu lista final y la cita para el cuerpo del trabajo."]}
      sections={[
    {
      title: "Reglas APA 7 que aplica el generador",
      content: (
        <>
          <p>Autores con apellidos completos e iniciales de los nombres; hasta 20 autores en la referencia y, desde 21, los 19 primeros, puntos suspensivos y el último.</p>
          <p>Fecha entre paréntesis y “(s. f.)” si no hay fecha; en páginas web, día y mes cuando se conocen.</p>
          <p>Títulos de libros, páginas web y tesis en cursiva; en artículos, en cursiva el nombre de la revista y el volumen.</p>
          <p>DOI presentado como enlace https://doi.org/; en la cita dentro del texto, “et al.” desde tres autores.</p>
        </>
      ),
    },
    {
      title: "Revisa antes de entregar",
      content: (
        <>
          <p>El generador no cambia las mayúsculas del título: en APA 7 van en tipo oración. Verifica también las normas específicas de tu universidad o docente, que pueden pedir variaciones.</p>
        </>
      ),
    },
      ]}
    >
      <CitationForm />
    </ToolPage>
  );
}
