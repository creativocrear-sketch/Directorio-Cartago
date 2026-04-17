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
    streamUrl: "https://mytuner-radio.com/radio/cartago-stereo-445541/",
    city: "Cartago",
    genre: "Variada",
    useIframe: true,
  },
  {
    id: "2",
    name: "Tropicana Bogotá",
    frequency: "102.9 FM",
    streamUrl: "https://mytuner-radio.com/radio/tropicana-bogota-403873/",
    city: "Bogotá",
    genre: "Salsa",
    useIframe: true,
  },
  {
    id: "3",
    name: "Radio Cartago",
    frequency: "107.9 FM",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/MEGA.mp3",
    city: "Cartago",
    genre: "Pop",
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
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <RadioIcon className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Radio en Vivo</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Escucha las mejores emisoras de Colombia, incluyendo estaciones del Valle del Cauca
          </p>
        </div>

        {/* Main Player Card */}
        <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <RadioIcon className="h-8 w-8 text-primary" />
              {selectedStation.name}
            </CardTitle>
            <p className="text-muted-foreground">{selectedStation.frequency} • {selectedStation.city}</p>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
            
            {selectedStation.useIframe ? (
              <div className="rounded-lg overflow-hidden border border-border shadow-lg">
                <iframe
                  src={selectedStation.streamUrl}
                  className="w-full h-[500px]"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
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
                  className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent" />
                  ) : isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Stations */}
        <h2 className="text-2xl font-bold tracking-tight mb-4">Otras Emisoras</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {radioStations.map((station) => (
            <Card
              key={station.id}
              className={`cursor-pointer transition-all hover:shadow-xl ${
                selectedStation?.id === station.id
                  ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handlePlay(station)}
            >
              <CardHeader className="pb-3">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <RadioIcon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-lg">{station.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Waves className="h-4 w-4" />
                    {station.frequency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{station.city}</span> • {station.genre}
                  </div>
                  {selectedStation?.id === station.id && isPlaying && (
                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
                      <div className="flex gap-1">
                        <div className="h-2 w-1 animate-pulse rounded-full bg-primary" />
                        <div className="h-2 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.1s" }} />
                        <div className="h-2 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
                      </div>
                      Reproduciendo
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Nota:</strong> Algunas emisoras pueden tener restricciones geográficas o requiren conexión estable.
            Las emisoras mostradas son de Colombia y la región del Valle del Cauca.
          </p>
        </div>
      </div>
    </Layout>
  );
}
