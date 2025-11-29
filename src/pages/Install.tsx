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
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold">Install Cuddles AI App</h1>
          
          {isInstalled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle className="w-6 h-6" />
                <p className="text-lg font-semibold">App is Already Installed!</p>
              </div>
              <p className="text-muted-foreground">You can access it from your home screen.</p>
              <Button onClick={() => navigate('/')} className="w-full" size="lg">
                Go to Home
              </Button>
            </div>
          ) : (
            <>
              <p className="text-lg text-muted-foreground">
                Install Cuddles AI on your phone for the best experience - it works just like a native app!
              </p>

              {isIOS ? (
                <div className="space-y-6">
                  <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary/20">
                    <p className="font-bold text-lg mb-4 text-center">📱 iPhone/iPad Instructions</p>
                    <ol className="space-y-4 text-left">
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">1.</span>
                        <span>Open this page in <strong>Safari browser</strong> (must be Safari, not Chrome)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">2.</span>
                        <span>Tap the <strong>Share button</strong> (square with arrow pointing up) at the bottom of Safari</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">3.</span>
                        <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">4.</span>
                        <span>Tap <strong>"Add"</strong> in the top right corner</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">5.</span>
                        <span>Find the Cuddles AI icon on your home screen and tap it to open!</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                    <p className="text-sm font-semibold">⚠️ Important: Must use Safari browser on iOS</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      If you're in Chrome or another browser, copy the URL and open it in Safari.
                    </p>
                  </div>
                </div>
              ) : deferredPrompt ? (
                <div className="space-y-4">
                  <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary/20">
                    <p className="font-bold text-lg mb-3 text-center">🤖 Android - Quick Install</p>
                    <p className="text-center mb-4">Click the button below to install instantly:</p>
                    <Button onClick={handleInstall} className="w-full" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      Install App Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary/20">
                    <p className="font-bold text-lg mb-4 text-center">🤖 Android Instructions</p>
                    <ol className="space-y-4 text-left">
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">1.</span>
                        <span>Open this page in <strong>Chrome browser</strong></span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">2.</span>
                        <span>Tap the <strong>three dots menu</strong> (⋮) in the top right corner</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">3.</span>
                        <span>Look for <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">4.</span>
                        <span>Tap <strong>"Install"</strong> when prompted</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-primary min-w-[24px]">5.</span>
                        <span>Find the Cuddles AI icon on your home screen and tap it to open!</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  Skip for Now - Continue in Browser
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="pt-6 border-t space-y-3">
          <h3 className="font-semibold text-lg text-center">Why Install?</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="font-semibold mb-1">⚡ Faster</div>
              <div className="text-muted-foreground text-xs">Lightning-fast loading</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="font-semibold mb-1">📱 Native Feel</div>
              <div className="text-muted-foreground text-xs">Works like a real app</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="font-semibold mb-1">🔌 Offline</div>
              <div className="text-muted-foreground text-xs">Works without internet</div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="font-semibold mb-1">🏠 Easy Access</div>
              <div className="text-muted-foreground text-xs">Launch from home screen</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Install;