import React, { useState } from 'react';
import { useSession }  from './hooks/useSession';
import { PageShoot }   from './pages/PageShoot';
import { PageEdit }    from './pages/PageEdit';

export default function App() {
  const session  = useSession();
  const [page, setPage] = useState('shoot'); // 'shoot' | 'edit'

  if (page === 'shoot') {
    return <PageShoot session={session} onDone={() => setPage('edit')} />;
  }

  return <PageEdit session={session} onBack={() => setPage('shoot')} />;
}
