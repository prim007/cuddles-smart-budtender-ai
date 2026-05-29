import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInputButton = ({ onTranscript, disabled, className }: VoiceInputButtonProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { prime } = useSpeechSynthesis();

  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    language,
    onResult: (transcript) => {
      onTranscript(transcript);
      stopListening();
    },
    onError: (error) => {
      toast({
        title: t.error,
        description: error,
        variant: "destructive",
      });
    },
  });

  if (!isSupported) {
    return null;
  }

  const handleClick = () => {
    // Unlock speechSynthesis inside the user gesture so Cuddles can speak the
    // reply after the async AI roundtrip (Chrome blocks speak() otherwise).
    prime();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative transition-all border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/50",
        isListening && "animate-pulse bg-destructive/10 border-destructive/50",
        className
      )}
      title={isListening ? t.listening : t.tapToSpeak}
      aria-label={isListening ? t.listening : t.voiceInput}
    >
      {isListening ? (
        <>
          <MicOff className="h-5 w-5 text-destructive" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        </>
      ) : (
        <Mic className="h-5 w-5 text-primary" />
      )}
    </Button>
  );
};

export default VoiceInputButton;
