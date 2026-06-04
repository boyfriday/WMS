import ProtectedRoute from '../components/ProtectedRoute';

export default function Admin() {
  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <p className="text-gray-600">This page is only accessible to administrators.</p>
      </div>
    </ProtectedRoute>
  );
}
