import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <h2 className="text-3xl font-serif font-bold text-foreground mb-3">Page Not Found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        The craft or page you are looking for could not be found or may have been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
      >
        Return to Virasya Home
      </Link>
    </div>
  );
}
