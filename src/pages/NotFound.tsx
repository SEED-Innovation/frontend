
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-purple-50 via-white to-tennis-green-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-tennis-purple-600 to-tennis-green-500 bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/dashboard">
            <Button className="tennis-button w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="btn-outline w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
