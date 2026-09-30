import ToolPage from "@/components/tools/ToolPage";
import SimilarityChecker from "@/components/tools/similarity/SimilarityChecker";
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
      intro="Compara deberes, proyectos o capítulos de tesis entre sí y encuentra los fragmentos que coinciden. Obtienes el porcentaje exacto de cada documento con el conteo de palabras que lo respalda, los fragmentos resaltados y recomendaciones. Todo ocurre en tu navegador."
      howTo={["Pega el texto de cada documento o sube archivos .docx o .txt (hasta 10 documentos).", "Elige la sensibilidad: cuántas palabras seguidas idénticas cuentan como coincidencia.", "Si tu institución fija un porcentaje máximo, escríbelo para comparar los resultados con ese límite.", "Pulsa “Comparar documentos” y revisa los porcentajes, la tabla por pares, las recomendaciones y los fragmentos resaltados."]}
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
          <p>La herramienta compara únicamente los documentos que cargas. No consulta internet, revistas científicas ni repositorios de universidades, por lo que sus resultados no equivalen a los de servicios como Turnitin.</p>
          <p>No existe un porcentaje de similitud reglamentario universal: cada universidad o docente define su propio criterio.</p>
        </>
      ),
    },
    {
      title: "Privacidad",
      content: (
        <>
          <p>Los documentos se leen y comparan en tu navegador. No se suben ni se guardan en ningún servidor.</p>
        </>
      ),
    },
      ]}
    >
      <SimilarityChecker />
    </ToolPage>
  );
}
