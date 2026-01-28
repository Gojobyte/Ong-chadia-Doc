import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="mb-8">
          <FileQuestion className="w-24 h-24 text-gray-200 mx-auto" />
        </div>
        <h1 className="text-8xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Page non trouvée
        </h2>
        <p className="text-gray-500 mt-2 mb-8 max-w-md mx-auto">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4 justify-center">
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
