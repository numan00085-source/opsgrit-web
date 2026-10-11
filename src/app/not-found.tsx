import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-32 text-center">
      <p className="text-sm font-semibold text-gold-700">404</p>
      <h1 className="mt-3 text-4xl font-extrabold text-ink-900">Page not found</h1>
      <p className="mt-3 text-ink-600">The page you are looking for does not exist or has moved.</p>
      <Link href="/blog" className="btn-primary mt-8">Browse articles</Link>
    </div>
  );
}
