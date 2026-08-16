import React from 'react';
import GalacticCatalog from './components/GalacticCatalog';
import { ErrorBoundary } from './components/ErrorBoundary';


const App = () => {
  return (
    <ErrorBoundary>
      <div className="w-screen h-screen overflow-hidden bg-black">
        <GalacticCatalog />
      </div>
    </ErrorBoundary>
  );
};

export default App;