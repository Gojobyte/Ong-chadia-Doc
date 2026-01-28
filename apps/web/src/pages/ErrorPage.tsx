import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error?: Error;
}

export default function ErrorPage({ error }: ErrorPageProps) {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-8">
          <AlertTriangle className="w-24 h-24 text-red-200 mx-auto" />
        </div>
        <h1 className="text-8xl font-bold text-gray-200">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Une erreur est survenue
        </h2>
        <p className="text-gray-500 mt-2 mb-4 max-w-md mx-auto">
          Nous nous excusons pour ce désagrément. Veuillez réessayer.
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <pre className="text-left text-xs text-red-600 bg-red-50 p-4 rounded-lg mb-8 max-w-md mx-auto overflow-auto">
            {error.message}
          </pre>
        )}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="btn-simple-outline"
          >
            Rafraîchir
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="btn-simple-outline"
          >
            Retour
          </Button>
          <Link to="/dashboard">
            <Button leftIcon={<Home className="w-4 h-4" />} className="btn-simple">
              Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
