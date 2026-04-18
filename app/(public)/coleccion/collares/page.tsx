import { redirect } from "next/navigation";

/** Atajo /coleccion/collares → /coleccion?category=collar. */
export default function Page() {
  redirect("/coleccion?category=collar");
}
