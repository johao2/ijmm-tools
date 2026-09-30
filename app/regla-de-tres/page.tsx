import ToolPage from "@/components/tools/ToolPage";
import RuleOfThreeForm from "@/components/tools/rule-of-three/RuleOfThreeForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("regla-de-tres");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/regla-de-tres",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="regla-de-tres"
      intro="Resuelve reglas de tres simples directas e inversas y ve la fórmula aplicada con tus propios valores."
      howTo={["Elige si la relación es directa (ambas magnitudes aumentan) o inversa (una aumenta y la otra disminuye).", "Escribe A y su valor correspondiente B, y el nuevo valor C.", "Obtén x con la fórmula utilizada."]}
      sections={[
    {
      title: "Fórmulas",
      content: (
        <>
          <p>Directa: x = (B × C) ÷ A. Inversa: x = (A × B) ÷ C.</p>
        </>
      ),
    },
      ]}
    >
      <RuleOfThreeForm />
    </ToolPage>
  );
}
