import ToolPage from "@/components/tools/ToolPage";
import EquationsForm from "@/components/tools/equations/EquationsForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("resolver-ecuaciones");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/resolver-ecuaciones",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="resolver-ecuaciones"
      intro="Resuelve ecuaciones de segundo grado con el discriminante y raíces exactas (racionales, irracionales o complejas), y sistemas de ecuaciones lineales con su clasificación."
      howTo={[
        "Elige el tipo de ecuación.",
        "Para una ecuación de segundo grado escribe a, b y c. Para un sistema, escribe cada ecuación en una línea: los coeficientes y al final el término independiente.",
        "Revisa las raíces exactas, su valor decimal y los pasos del cálculo.",
      ]}
      sections={[
        {
          title: "Fórmulas y criterios",
          content: (
            <>
              <p>Ecuación de segundo grado: Δ = b² − 4ac y x = (−b ± √Δ) ÷ 2a. Si Δ &gt; 0 hay dos raíces reales, si Δ = 0 una doble y si Δ &lt; 0 dos complejas conjugadas.</p>
              <p>Sistemas lineales (teorema de Rouché-Frobenius): si el rango de la matriz de coeficientes es menor que el de la ampliada, el sistema es incompatible. Si ambos son iguales al número de incógnitas, la solución es única; si son menores, hay infinitas soluciones.</p>
            </>
          ),
        },
      ]}
    >
      <EquationsForm />
    </ToolPage>
  );
}
