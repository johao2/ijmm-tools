import ToolPage from "@/components/tools/ToolPage";
import WordCounterForm from "@/components/tools/word-counter/WordCounterForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("contador-de-palabras");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/contador-de-palabras",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="contador-de-palabras"
      intro="Cuenta al instante las palabras, caracteres con y sin espacios, oraciones y párrafos de tu texto, y estima el tiempo de lectura, el tiempo de exposición y el número de páginas."
      howTo={["Escribe o pega tu texto en el recuadro.", "Si tu trabajo tiene un límite de palabras, escríbelo para ver cuántas te faltan o te sobran.", "Revisa las palabras más repetidas para mejorar la variedad de tu redacción."]}
      sections={[
    {
      title: "Cómo se calculan los resultados",
      content: (
        <>
          <p>Las palabras y caracteres se cuentan de forma exacta. El tiempo de lectura usa 200 palabras por minuto y el de exposición 130 palabras por minuto; las páginas son una aproximación de 275 palabras a doble espacio y 550 a espacio simple.</p>
        </>
      ),
    },
    {
      title: "Privacidad",
      content: (
        <>
          <p>El texto se analiza en tu navegador y no se envía a ningún servidor.</p>
        </>
      ),
    },
      ]}
    >
      <WordCounterForm />
    </ToolPage>
  );
}
