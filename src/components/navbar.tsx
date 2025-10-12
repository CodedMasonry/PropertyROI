import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  return (
    <div className="flex w-full items-center p-2">
      <div className="ml-4"></div>
      <div className="mr-2 ml-auto flex">
        <ModeToggle />
      </div>
    </div>
  );
}
