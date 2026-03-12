import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-400">Seite nicht gefunden</p>
      <Link to="/" className="text-blue-400 hover:text-blue-300">
        Zurück zum Dashboard
      </Link>
    </div>
  )
}
