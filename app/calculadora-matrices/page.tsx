import ToolPage from "@/components/tools/ToolPage";
import MatrixForm from "@/components/tools/matrices/MatrixForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("calculadora-matrices");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/calculadora-matrices",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="calculadora-matrices"
      intro="Calcula determinantes, inversas, traspuestas, rango y la forma escalonada reducida, además de sumar, restar y multiplicar matrices. Los resultados son exactos, en fracciones."
      howTo={[
        "Elige la operación.",
        "Escribe la matriz A con una fila por línea y los valores separados por espacios. Si la operación usa dos matrices, escribe también B.",
        "El resultado se actualiza al escribir. Muéstralo en decimales si lo prefieres y cópialo para pegarlo en Excel.",
      ]}
      sections={[
        {
          title: "Métodos",
          content: (
            <>
              <p>Determinante por eliminación gaussiana (cada intercambio de filas cambia el signo). Inversa, rango y forma escalonada reducida por Gauss-Jordan sobre [A | I].</p>
              <p>Producto: (A × B)ᵢⱼ = Σₖ aᵢₖ · bₖⱼ. Solo es posible si las columnas de A son iguales a las filas de B.</p>
              <p>Todos los cálculos usan fracciones de precisión arbitraria, por lo que no hay errores de redondeo.</p>
            </>
          ),
        },
      ]}
    >
      <MatrixForm />
    </ToolPage>
  );
}
