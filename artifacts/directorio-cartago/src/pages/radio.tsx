import React, { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Volume2, Radio as RadioIcon, Waves } from "lucide-react";

interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  streamUrl: string;
  alternativeStreamUrl?: string;
  city: string;
  genre: string;
  logo?: string;
  useIframe?: boolean;
}

const radioStations: RadioStation[] = [
  {
    id: "1",
    name: "Cartago Stereo",
    frequency: "89.0 FM",
    streamUrl: "https://tunein.com/embed/player/s243337/",
    city: "Cartago",
    genre: "Variada",
    useIframe: true,
  },
  {
    id: "2",
    name: "Tropicana Bogotá",
    frequency: "102.9 FM",
    streamUrl: "https://tunein.com/embed/player/s16487/",
    city: "Bogotá",
    genre: "Salsa",
    useIframe: true,
  },
  {
    id: "3",
    name: "Caracol Radio",
    frequency: "100.9 FM",
    streamUrl: "https://tunein.com/embed/player/s16182/",
    city: "Bogotá",
    genre: "Noticias",
    useIframe: true,
  },
  {
    id: "4",
    name: "W Radio",
    frequency: "99.4 FM",
    streamUrl: "https://tunein.com/embed/player/s309390/",
    city: "Bogotá",
    genre: "Noticias",
    useIframe: true,
  },
];

export function RadioPage() {
  const [selectedStation, setSelectedStation] = useState<RadioStation>(radioStations[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingAlternative, setUsingAlternative] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlay = (station: RadioStation) => {
    setError(null);
    setUsingAlternative(false);
    if (selectedStation?.id === station.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        audioRef.current?.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            setError("No se pudo reproducir la emisora. Intenta otra.");
            setIsPlaying(false);
            setIsLoading(false);
            console.error("Audio play error:", err);
          });
      }
    } else {
      setSelectedStation(station);
      setIsPlaying(true);
      setIsLoading(true);
    }
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleAudioError = () => {
    // Try alternative stream first if available
    if (!usingAlternative && selectedStation?.alternativeStreamUrl) {
      setError(`Error con stream principal. Intentando alternativa...`);
      setUsingAlternative(true);
      setIsLoading(true);
      if (audioRef.current) {
        audioRef.current.src = selectedStation.alternativeStreamUrl;
        audioRef.current.load();
      }
      return;
    }
    
    // Try to find a working station automatically
    const currentIndex = radioStations.findIndex(s => s.id === selectedStation?.id);
    const nextIndex = (currentIndex + 1) % radioStations.length;
    const nextStation = radioStations[nextIndex];
    
    setError(`Error al cargar ${selectedStation?.name}. Intentando con ${nextStation.name}...`);
    setIsPlaying(false);
    setIsLoading(false);
    setUsingAlternative(false);
    
    // Auto-switch to next station after short delay
    setTimeout(() => {
      setError(null);
      setSelectedStation(nextStation);
      setIsPlaying(true);
      setIsLoading(true);
    }, 2000);
  };

  const handleAudioLoad = () => {
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {error && (
          <div className="mb-4 max-w-md w-full rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        {/* Minimalist Player */}
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold mb-1">{selectedStation.name}</h1>
            <p className="text-sm text-muted-foreground">{selectedStation.frequency} • {selectedStation.city}</p>
          </div>

          {selectedStation.useIframe ? (
            <div className="rounded-lg overflow-hidden border border-border bg-white">
              <iframe
                src={selectedStation.streamUrl}
                className="w-full h-[400px]"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                autoPlay
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <audio
                ref={audioRef}
                src={usingAlternative && selectedStation?.alternativeStreamUrl ? selectedStation.alternativeStreamUrl : selectedStation.streamUrl}
                autoPlay={isPlaying}
                onPlay={() => {
                  setIsPlaying(true);
                  setIsLoading(false);
                }}
                onPause={() => {
                  setIsPlaying(false);
                  setIsLoading(false);
                }}
                onError={handleAudioError}
                onLoadedData={handleAudioLoad}
                className="w-full"
              />
              <Button
                size="lg"
                onClick={isPlaying ? handlePause : () => handlePlay(selectedStation)}
                disabled={isLoading}
                className="h-14 w-14 rounded-full bg-primary text-white"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-white border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>
            </div>
          )}

          {/* Station Selector */}
          <div className="mt-8">
            <div className="flex flex-wrap justify-center gap-2">
              {radioStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handlePlay(station)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedStation?.id === station.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {station.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
