import { redirect } from "next/navigation";

/** Atajo /coleccion/cadenas → /coleccion?category=cadena. */
export default function Page() {
  redirect("/coleccion?category=cadena");
}
