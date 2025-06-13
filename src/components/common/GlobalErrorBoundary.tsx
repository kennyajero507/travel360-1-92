
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { enhancedErrorService } from '../../services/enhancedErrorService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error 
    };
  }

  public async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    
    this.setState({ 
      error, 
      errorInfo 
    });

    // Log error to our enhanced error service
    try {
      await enhancedErrorService.logError({
        type: 'react_error_boundary',
        message: error.message,
        stack: error.stack,
        context: {
          componentStack: errorInfo.componentStack,
          errorBoundary: 'GlobalErrorBoundary'
        },
        severity: 'high'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-700 mb-4">
                  We're sorry, but something went wrong. The error has been logged and our team will investigate.
                </p>
                
                {this.state.error && (
                  <details className="bg-gray-50 p-3 rounded border">
                    <summary className="cursor-pointer font-medium text-sm">
                      Technical Details
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong className="text-xs">Error:</strong>
                        <pre className="text-xs mt-1 whitespace-pre-wrap text-red-600">
                          {this.state.error.message}
                        </pre>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong className="text-xs">Stack Trace:</strong>
                          <pre className="text-xs mt-1 whitespace-pre-wrap text-gray-600 max-h-32 overflow-y-auto">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                If this problem persists, please contact support with the error details above.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
