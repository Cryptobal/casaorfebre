import { redirect } from "next/navigation";

/** Atajo /coleccion/aros → /coleccion?category=aros (todos los materiales). */
export default function Page() {
  redirect("/coleccion?category=aros");
}
