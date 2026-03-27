import { BlogEditor } from "../_components/blog-editor";

export default function NuevoArticuloPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Nuevo artículo</h1>
      <div className="mt-8">
        <BlogEditor />
      </div>
    </div>
  );
}
