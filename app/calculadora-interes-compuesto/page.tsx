import ToolPage from "@/components/tools/ToolPage";
import InterestForm from "@/components/tools/finance/InterestForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("calculadora-interes-compuesto");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/calculadora-interes-compuesto",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="calculadora-interes-compuesto"
      intro="Calcula el interés simple y compuesto con distintas capitalizaciones, la tasa efectiva anual y la tabla de amortización con cuota fija (método francés), lista para copiar a Excel."
      howTo={["Elige el tipo de cálculo.", "Escribe el capital o monto del préstamo, la tasa nominal anual y el tiempo.", "En interés compuesto, elige la capitalización; en amortización, el plazo en meses."]}
      sections={[
    {
      title: "Fórmulas",
      content: (
        <>
          <p>Interés simple: I = C × r × t. Interés compuesto: M = C × (1 + r/n)^(n × t). Tasa efectiva anual: (1 + r/n)^n − 1.</p>
          <p>Cuota fija (método francés): cuota = C × i ÷ (1 − (1 + i)^−n), con i = tasa anual ÷ 12. La última cuota ajusta los centavos de redondeo para dejar el saldo en cero.</p>
        </>
      ),
    },
    {
      title: "Aviso",
      content: (
        <>
          <p>Los resultados son cálculos matemáticos de referencia. Un banco puede incluir seguros, comisiones o impuestos que cambian la cuota real.</p>
        </>
      ),
    },
      ]}
    >
      <InterestForm />
    </ToolPage>
  );
}
