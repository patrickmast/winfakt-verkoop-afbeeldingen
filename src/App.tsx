import { useState, useEffect, useCallback } from 'react';
import type { WinfaktAppData } from './types';
import { SaleRowImagesList } from './components/SaleRowImagesList';

function App() {
  const [appData, setAppData] = useState<WinfaktAppData | null>(null);
  const [isInIframe] = useState(() => window.parent !== window);
  const [isWaitingForData, setIsWaitingForData] = useState(true);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data?.app) {
      setAppData(event.data.app);
      setIsWaitingForData(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    if (isInIframe) {
      window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

      const timeout = setTimeout(() => {
        setIsWaitingForData(false);
      }, 3000);

      return () => {
        window.removeEventListener('message', handleMessage);
        clearTimeout(timeout);
      };
    } else {
      setIsWaitingForData(false);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage, isInIframe]);

  // Wait for data in iframe mode
  if (isInIframe && isWaitingForData) {
    return null;
  }

  // Standalone page (not in iframe)
  if (!appData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Verkoop Afbeeldingen
          </h1>
          <p className="text-gray-600 mb-6">
            Deze applicatie toont een overzicht van alle verkoopdocument detailregels met gekoppelde afbeeldingen.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Open deze pagina via Winfakt Online om de afbeeldingen te bekijken.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <SaleRowImagesList appData={appData} />;
}

export default App;
