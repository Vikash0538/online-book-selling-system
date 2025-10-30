export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <p className="mt-4 text-2xl font-semibold text-gray-700">Page not found</p>
        <p className="mt-2 text-gray-600">We couldn't find what you're looking for. It may have been removed or the URL is incorrect.</p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go back home
          </a>
        </div>
      </div>
    </div>
  );
}
