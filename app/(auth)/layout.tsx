import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Image src="/casaorfebre-logo-compact.svg" alt="Casa Orfebre" width={160} height={36} priority />
        </Link>
        {children}
      </div>
    </div>
  );
}
