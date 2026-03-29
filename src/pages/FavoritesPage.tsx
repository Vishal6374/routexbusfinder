import React, { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { busRoutes } from "@/data/buses";
import BusCard from "@/components/BusCard";
import { Bus, ArrowLeft } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";

const FavoritesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const savedIds: string[] = useMemo(() => {
    const saved = localStorage.getItem("tn-bus-favorites");
    return saved ? JSON.parse(saved) : [];
  }, []);

  const favoriteBuses = useMemo(
    () => busRoutes.filter((b) => savedIds.includes(b.id)),
    [savedIds]
  );

  const handleRemove = (busId: string) => {
    const updated = savedIds.filter((id) => id !== busId);
    localStorage.setItem("tn-bus-favorites", JSON.stringify(updated));
    window.location.reload(); // simple reload to refresh
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="rounded-full p-1 text-muted-foreground hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold text-foreground">{t.favorites.title}</span>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="container max-w-lg py-6">
        {favoriteBuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bus className="mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-semibold text-foreground">{t.favorites.noFavorites}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favoriteBuses.map((bus) => (
              <div key={bus.id} className="relative">
                <BusCard bus={bus} />
                <button
                  onClick={() => handleRemove(bus.id)}
                  className="absolute right-3 top-3 text-xs font-medium text-destructive hover:underline"
                >
                  {t.favorites.remove}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
