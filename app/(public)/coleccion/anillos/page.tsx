import { redirect } from "next/navigation";

/**
 * Atajo de URL: /coleccion/anillos → /coleccion?category=anillo
 * Muestra todos los anillos (cualquier material) con hero editorial,
 * sidebar de filtros, 8 opciones de orden y grid editorial.
 */
export default function Page() {
  redirect("/coleccion?category=anillo");
}
