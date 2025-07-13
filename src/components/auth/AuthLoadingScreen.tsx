import React from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthLoadingScreenProps {
  stage?: 'checking' | 'signing-in' | 'loading-profile' | 'redirecting';
  message?: string;
}

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ 
  stage = 'checking', 
  message 
}) => {
  const getStageMessage = () => {
    if (message) return message;
    
    switch (stage) {
      case 'checking':
        return 'Checking authentication...';
      case 'signing-in':
        return 'Signing you in...';
      case 'loading-profile':
        return 'Loading your profile...';
      case 'redirecting':
        return 'Redirecting...';
      default:
        return 'Loading...';
    }
  };

  const getVariant = () => {
    switch (stage) {
      case 'checking':
        return 'dots';
      case 'signing-in':
        return 'default';
      case 'loading-profile':
        return 'pulse';
      case 'redirecting':
        return 'dots';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">TravelFlow360</h2>
          <LoadingSpinner 
            size="lg" 
            text={getStageMessage()} 
            variant={getVariant()}
          />
        </div>
        
        {stage === 'checking' && (
          <p className="text-sm text-muted-foreground">
            This will only take a moment...
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthLoadingScreen;