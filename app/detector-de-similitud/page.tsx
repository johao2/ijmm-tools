import ToolPage from "@/components/tools/ToolPage";
import SimilarityChecker from "@/components/tools/similarity/SimilarityChecker";
import SourceSearch from "@/components/tools/similarity/SourceSearch";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("detector-de-similitud");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/detector-de-similitud",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="detector-de-similitud"
      intro="Revisa la similitud de deberes, proyectos y tesis de dos formas: compara varios documentos entre sí (en tu navegador) o busca coincidencias en internet y en repositorios académicos con enlace directo a cada fuente. Cada porcentaje se muestra con el conteo exacto de palabras que lo respalda, junto a los fragmentos resaltados y recomendaciones."
      howTo={["Pega el texto de cada documento o sube archivos .docx, .pdf o .txt (hasta 10 documentos).", "Elige la sensibilidad: cuántas palabras seguidas idénticas cuentan como coincidencia.", "Si tu institución fija un porcentaje máximo, escríbelo para comparar los resultados con ese límite.", "Pulsa “Comparar documentos” y revisa los porcentajes, la tabla por pares, las recomendaciones y los fragmentos resaltados.", "Para buscar en internet y repositorios, pega o sube tu trabajo en la segunda sección, acepta el envío del texto y pulsa “Buscar en internet y repositorios”."]}
      sections={[
    {
      title: "Método y exactitud",
      content: (
        <>
          <p>El análisis es determinista: los mismos documentos producen siempre el mismo resultado. Se consideran coincidencia las secuencias de palabras consecutivas idénticas (4, 5 o 7 según la sensibilidad), sin distinguir mayúsculas, tildes ni signos de puntuación.</p>
          <p>El porcentaje de cada documento es el número de palabras que forman parte de alguna coincidencia dividido entre el total de palabras del documento, redondeado a un decimal. Junto a cada porcentaje se muestra el conteo exacto para que puedas verificarlo.</p>
        </>
      ),
    },
    {
      title: "Alcance",
      content: (
        <>
          <p>La comparación entre documentos analiza únicamente los documentos que cargas. La búsqueda en internet consulta la web y repositorios de acceso abierto (CORE y OpenAlex) con frases de tu documento y compara cada fuente encontrada con el mismo método exacto.</p>
          <p>Ninguna de las dos incluye trabajos entregados en plataformas privadas como Turnitin, revistas de pago ni documentos escaneados sin texto. Si no se encuentran coincidencias, no se garantiza que no existan en fuentes que los buscadores no indexan.</p>
          <p>No existe un porcentaje de similitud reglamentario universal: cada universidad o docente define su propio criterio.</p>
        </>
      ),
    },
    {
      title: "Privacidad",
      content: (
        <>
          <p>La comparación entre documentos ocurre en tu navegador. En la búsqueda en internet, el texto se envía a nuestros servidores solo con tu consentimiento, se usa para consultar frases en los buscadores y se descarta al terminar: no se guarda.</p>
        </>
      ),
    },
      ]}
    >
      <div className="space-y-12">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text)]">1. Comparar documentos entre sí</h2>
          <SimilarityChecker />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text)]">2. Buscar coincidencias en internet y repositorios académicos</h2>
          <SourceSearch />
        </section>
      </div>
    </ToolPage>
  );
}
