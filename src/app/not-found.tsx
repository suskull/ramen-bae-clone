import { NotFoundError } from '@/components/error'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <NotFoundError
        title="Page Not Found"
        message="The page you are looking for doesn't exist or has been moved."
      />
    </div>
  )
}
