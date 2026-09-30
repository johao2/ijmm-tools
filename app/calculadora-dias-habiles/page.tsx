import ToolPage from "@/components/tools/ToolPage";
import BusinessDaysForm from "@/components/tools/business-days/BusinessDaysForm";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("calculadora-dias-habiles");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/calculadora-dias-habiles",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="calculadora-dias-habiles"
      intro="Cuenta los días hábiles entre dos fechas o calcula el vencimiento de un plazo en días hábiles, sin contar fines de semana ni los feriados nacionales de Ecuador."
      howTo={[
        "Elige si quieres contar días hábiles entre dos fechas o sumar días hábiles a una fecha.",
        "Ingresa las fechas. Los feriados nacionales de Ecuador se excluyen automáticamente, con sus traslados de ley.",
        "Revisa la lista de feriados del intervalo. Desmarca los que no apliquen o agrega feriados locales y días decretados.",
      ]}
      sections={[
        {
          title: "Base legal de los feriados",
          content: (
            <>
              <p>Feriados nacionales de descanso obligatorio según el art. 65 del Código del Trabajo y la Disposición General Cuarta de la LOSEP, con los traslados de la Ley Orgánica Reformatoria publicada en el Registro Oficial Suplemento 906 del 20 de diciembre de 2016.</p>
              <p>Traslados: martes → lunes anterior; miércoles o jueves → viernes de la misma semana; sábado → viernes anterior; domingo → lunes siguiente. El 1 de enero, el 25 de diciembre y el martes de carnaval no se trasladan entre semana. El 2 y 3 de noviembre siguen las reglas de la Disposición General Primera para feriados consecutivos.</p>
              <p>El Presidente de la República puede modificar el calendario o declarar días de descanso mediante decreto ejecutivo. Verifica siempre el calendario oficial del año.</p>
            </>
          ),
        },
      ]}
    >
      <BusinessDaysForm />
    </ToolPage>
  );
}
