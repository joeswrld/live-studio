import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-semibold text-white">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-live">
        <Radio className="h-4 w-4" />
      </span>
      Live Studio
    </Link>
  );
}
