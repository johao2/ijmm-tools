import ToolPage from "@/components/tools/ToolPage";
import StatisticsForm from "@/components/tools/statistics/StatisticsForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("calculadora-estadistica");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/calculadora-estadistica",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="calculadora-estadistica"
      intro="Calcula las medidas de estadística descriptiva de tus datos: media, mediana, moda, varianza y desviación estándar (muestral y poblacional), cuartiles, rango y coeficiente de variación."
      howTo={["Pega tus datos separados por saltos de línea, espacios, comas o punto y coma.", "Revisa si se ignoró algún valor no numérico.", "Copia todos los resultados con un clic para tu informe."]}
      sections={[
    {
      title: "Fórmulas utilizadas",
      content: (
        <>
          <p>Media: x̄ = Σx ÷ n. Varianza muestral: s² = Σ(x − x̄)² ÷ (n − 1). Varianza poblacional: σ² = Σ(x − x̄)² ÷ n. Coeficiente de variación: (s ÷ |x̄|) × 100.</p>
          <p>Los cuartiles se calculan por interpolación lineal, el mismo método de la función CUARTIL.INC de Excel. Los resultados se muestran con hasta 6 decimales.</p>
        </>
      ),
    },
      ]}
    >
      <StatisticsForm />
    </ToolPage>
  );
}
