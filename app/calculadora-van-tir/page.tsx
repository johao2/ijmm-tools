import ToolPage from "@/components/tools/ToolPage";
import InvestmentForm from "@/components/tools/investment/InvestmentForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("calculadora-van-tir");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/calculadora-van-tir",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="calculadora-van-tir"
      intro="Evalúa un proyecto de inversión con el VAN, la TIR, el índice de rentabilidad y el periodo de recuperación simple y descontado, con la tabla completa de flujos descontados."
      howTo={[
        "Escribe la tasa de descuento por periodo (la rentabilidad mínima que exiges al proyecto).",
        "Ingresa los flujos de caja, uno por línea, empezando por el periodo 0 (la inversión inicial, en negativo).",
        "Revisa el VAN, la TIR y el periodo de recuperación. Copia el resumen o consulta la tabla de flujos descontados.",
      ]}
      sections={[
        {
          title: "Fórmulas utilizadas",
          content: (
            <>
              <p>VAN = Σ FCₜ ÷ (1 + i)ᵗ, con t desde 0 hasta n. El flujo del periodo 0 no se descuenta.</p>
              <p>TIR: la tasa que cumple Σ FCₜ ÷ (1 + TIR)ᵗ = 0. Se calcula numéricamente con precisión de 10⁻¹², se muestra con 4 decimales y, si existen varias, aparecen todas.</p>
              <p>Índice de rentabilidad = valor presente de los flujos futuros ÷ inversión inicial. Si es mayor que 1, el VAN es positivo.</p>
              <p>En Excel: VAN = VNA(i; FC₁:FCₙ) + FC₀ y TIR = TIR(FC₀:FCₙ).</p>
            </>
          ),
        },
      ]}
    >
      <InvestmentForm />
    </ToolPage>
  );
}
