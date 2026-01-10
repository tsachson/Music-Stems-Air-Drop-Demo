import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { ArtistPortal } from './components/ArtistPortal';
import { SponsorPortal } from './components/SponsorPortal';
import { CreatorPortal } from './components/CreatorPortal';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  switch (user.role) {
    case 'artist':
      return <ArtistPortal />;
    case 'sponsor':
      return <SponsorPortal />;
    case 'creator':
      return <CreatorPortal />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gray-600">Unknown user role</div>
        </div>
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
