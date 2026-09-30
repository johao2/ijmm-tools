import ToolPage from "@/components/tools/ToolPage";
import TruthTableForm from "@/components/tools/truth-table/TruthTableForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("generador-tablas-de-verdad");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/generador-tablas-de-verdad",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="generador-tablas-de-verdad"
      intro="Escribe una proposición lógica y obtén su tabla de verdad completa, con una columna por cada paso intermedio y la clasificación como tautología, contradicción o contingencia."
      howTo={[
        "Escribe la proposición con los botones de símbolos o con el teclado (por ejemplo, p -> q).",
        "La tabla se genera al escribir: primero las variables, después cada subexpresión y al final la proposición completa.",
        "Copia la tabla para pegarla en Word o Excel.",
      ]}
      sections={[
        {
          title: "Conectivos lógicos",
          content: (
            <>
              <p>¬p (negación) es verdadera cuando p es falsa. p ∧ q (conjunción) solo es verdadera si ambas lo son. p ∨ q (disyunción) es falsa solo si ambas son falsas. p ⊕ q (disyunción exclusiva) es verdadera si exactamente una es verdadera.</p>
              <p>p → q (condicional) solo es falsa cuando p es verdadera y q falsa. p ↔ q (bicondicional) es verdadera cuando ambas tienen el mismo valor.</p>
            </>
          ),
        },
      ]}
    >
      <TruthTableForm />
    </ToolPage>
  );
}
