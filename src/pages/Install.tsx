import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background p-4 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold">Install Cuddles AI</h1>
          
          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle className="w-6 h-6" />
                <p className="text-lg">App is installed!</p>
              </div>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Home
              </Button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground">
                Install our app for the best experience. Access it instantly from your home screen!
              </p>

              {isIOS ? (
                <div className="space-y-4 text-left bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold">iOS Installation Steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Tap the Share button in Safari</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" in the top right</li>
                    <li>Open the app from your home screen</li>
                  </ol>
                </div>
              ) : deferredPrompt ? (
                <Button onClick={handleInstall} className="w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Install App
                </Button>
              ) : (
                <div className="space-y-4 text-left bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold">Android Installation Steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Tap the menu button (three dots) in Chrome</li>
                    <li>Tap "Install app" or "Add to Home screen"</li>
                    <li>Confirm the installation</li>
                    <li>Open the app from your home screen</li>
                  </ol>
                </div>
              )}

              <div className="pt-4">
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  Continue in Browser
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="pt-6 border-t space-y-2 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground">Benefits:</h3>
          <ul className="space-y-1">
            <li>✓ Works offline</li>
            <li>✓ Faster loading</li>
            <li>✓ Easy access from home screen</li>
            <li>✓ Native app experience</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Install;