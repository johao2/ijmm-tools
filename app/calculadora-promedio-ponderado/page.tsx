import ToolPage from "@/components/tools/ToolPage";
import GradeCalculatorForm from "@/components/tools/grades/GradeCalculatorForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("calculadora-promedio-ponderado");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/calculadora-promedio-ponderado",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="calculadora-promedio-ponderado"
      intro="Calcula tu promedio ponderado a partir de las notas y el porcentaje de cada componente, y descubre la nota que necesitas en el examen final para aprobar. Funciona con escalas sobre 10, 20 o 100."
      howTo={["Elige la escala de notas de tu universidad.", "Escribe cada componente (deberes, parciales, proyecto, examen) con su nota y su peso en porcentaje.", "Deja vacía la nota de lo que aún no rindes y escribe la nota mínima para aprobar.", "Mira tu promedio actual y la nota exacta que necesitas en lo pendiente."]}
      sections={[
    {
      title: "Fórmula del promedio ponderado",
      content: (
        <>
          <p>Cada nota se multiplica por su peso, se suman los resultados y se divide entre la suma de los pesos: Promedio = Σ (nota × peso) ÷ Σ pesos.</p>
          <p>La nota necesaria en lo pendiente es: (nota objetivo − puntos acumulados) ÷ peso pendiente. Los resultados se muestran redondeados a dos decimales.</p>
        </>
      ),
    },
    {
      title: "Privacidad",
      content: (
        <>
          <p>Todos los cálculos se hacen en tu navegador. Tus notas no se envían ni se guardan en ningún servidor.</p>
        </>
      ),
    },
      ]}
    >
      <GradeCalculatorForm />
    </ToolPage>
  );
}
