import MainForm from "@/components/home/main-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="bg-background text-foreground mx-16 my-8">
      <MainForm />
    </div>
  );
}
