import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- ErrorBoundary Component Definition ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error, errorInfo: null };
  }

  // FIX: Removed redundant `public` modifier. Class methods are public by default, and removing it ensures `this` is correctly typed, making `this.setState` accessible.
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full text-gray-800 dark:text-gray-200">
                <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-4">Oops! Something went wrong.</h1>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    The application has encountered a critical error. Please refresh the page to try again. If the problem persists, please check the technical details below.
                </p>
                
                {this.state.error && (
                    <details className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <summary className="font-semibold cursor-pointer text-gray-700 dark:text-gray-300">
                            Click to view technical details
                        </summary>
                        <div className="mt-4 text-sm overflow-auto max-h-60">
                            <h3 className="font-bold mb-2">Error Message</h3>
                            <pre className="p-2 bg-gray-200 dark:bg-gray-700 rounded text-red-600 dark:text-red-400 whitespace-pre-wrap break-words">
                                {this.state.error.toString()}
                            </pre>
                            
                            {this.state.errorInfo && (
                                <>
                                    <h3 className="font-bold mt-4 mb-2">Component Stack</h3>
                                    <pre className="p-2 bg-gray-200 dark:bg-gray-700 rounded whitespace-pre-wrap break-words">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </>
                            )}
                        </div>
                    </details>
                )}
            </div>
        </div>
      );
    }

    // FIX: Removed redundant `public` modifier. Class methods are public by default, and removing it ensures `this` is correctly typed, making `this.props` accessible.
    return this.props.children;
  }
}
// --- End of ErrorBoundary Component ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);