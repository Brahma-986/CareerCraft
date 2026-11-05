import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold text-heading">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">That link does not match a CareerCraft page.</p>
      <Link to="/" className="mt-5"><Button>Back home</Button></Link>
    </div>
  );
}
