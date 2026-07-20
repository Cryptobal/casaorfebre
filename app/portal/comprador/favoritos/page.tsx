import { redirect } from "next/navigation";

// Favoritos es una página de COMPRA y ahora vive en el chrome de la tienda
// (`/favoritos`). Mantenemos esta URL viva con un redirect permanente.
export default function FavoritosPortalRedirect() {
  redirect("/favoritos");
}
