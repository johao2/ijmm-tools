import ToolPage from "@/components/tools/ToolPage";
import PomodoroTimer from "@/components/tools/pomodoro/PomodoroTimer";
import { constructMetadata } from "@/lib/seo/metadata";
import { getToolBySlug } from "@/lib/tools/registry";

const tool = getToolBySlug("temporizador-pomodoro");

export const metadata = constructMetadata({
  title: tool?.seo.title ?? "",
  description: tool?.seo.description ?? "",
  canonicalPath: "/temporizador-pomodoro",
  keywords: tool?.seo.keywords,
});

export default function Page() {
  return (
    <ToolPage
      slug="temporizador-pomodoro"
      intro="Estudia con la técnica Pomodoro: bloques de concentración seguidos de descansos cortos y un descanso largo cada cierto número de bloques, con aviso sonoro al terminar cada fase."
      howTo={["Pulsa “Iniciar” para comenzar un bloque de enfoque.", "Al sonar el aviso, toma el descanso indicado y vuelve a iniciar.", "Ajusta los tiempos en la configuración si lo necesitas."]}
      sections={[
    {
      title: "Consejos para estudiar mejor",
      content: (
        <>
          <p>Durante el bloque de enfoque trabaja en una sola tarea y deja el celular lejos. En los descansos levántate y descansa la vista de la pantalla.</p>
        </>
      ),
    },
      ]}
    >
      <PomodoroTimer />
    </ToolPage>
  );
}
