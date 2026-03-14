import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold text-brand">404</h1>
      <p className="text-gray-600">Page not found</p>
      <Link to="/" className="text-sm text-brand hover:text-brand-light transition">
        Back to dashboard
      </Link>
    </div>
  )
}
