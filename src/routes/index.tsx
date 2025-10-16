import MainForm from "@/components/home/main-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="bg-background text-foreground md:w-1/2 md:mx-auto m-8">
      <MainForm />
    </div>
  );
}
