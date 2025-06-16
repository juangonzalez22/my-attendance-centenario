import { useRouter } from 'next/router';

export default function Menu() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('auth'); // Cerrar sesión
    router.push('/'); // Redirigir a la pantalla de contraseña
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl mb-4">Menú Principal</h1>
      <button onClick={() => router.push('/asistencias')} className="mt-2 px-6 py-3 bg-indigo-500 rounded">
        Ir a Asistencias
      </button>
      <button onClick={() => router.push('/gestion')} className="mt-2 px-6 py-3 bg-green-500 rounded">
        Gestión de Estudiantes
      </button>
      <button onClick={handleLogout} className="mt-2 px-6 py-3 bg-red-500 rounded">
        Cerrar Sesión
      </button>
    </div>
  );
}
