import { redirect } from "next/navigation";

/** Atajo /coleccion/colgantes → /coleccion?category=colgante. */
export default function Page() {
  redirect("/coleccion?category=colgante");
}
