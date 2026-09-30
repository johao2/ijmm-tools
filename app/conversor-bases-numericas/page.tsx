import ToolPage from "@/components/tools/ToolPage";
import NumberBaseForm from "@/components/tools/number-base/NumberBaseForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("conversor-bases-numericas");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/conversor-bases-numericas",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="conversor-bases-numericas"
      intro="Convierte números enteros entre binario, octal, decimal y hexadecimal, o cualquier base de 2 a 36, sin límite de tamaño ni pérdida de precisión."
      howTo={["Escribe el número (acepta prefijos 0b, 0o y 0x).", "Indica en qué base está escrito.", "Copia el resultado en la base que necesites."]}
      sections={[
    {
      title: "Precisión",
      content: (
        <>
          <p>La conversión usa aritmética de enteros de precisión arbitraria, por lo que el resultado es exacto incluso con números muy grandes.</p>
        </>
      ),
    },
      ]}
    >
      <NumberBaseForm />
    </ToolPage>
  );
}
