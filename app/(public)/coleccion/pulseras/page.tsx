import { redirect } from "next/navigation";

/** Atajo /coleccion/pulseras → /coleccion?category=pulsera. */
export default function Page() {
  redirect("/coleccion?category=pulsera");
}
