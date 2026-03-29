import React, { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageToggle from "@/components/LanguageToggle";
import SearchForm from "@/components/SearchForm";
import BusResults from "@/components/BusResults";
import RecentSearches, { RecentSearch } from "@/components/RecentSearches";
import { findBuses, BusRoute } from "@/data/buses";
import { stops } from "@/data/stops";
import { Bus, Heart, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { t, lang } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<BusRoute[] | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    const saved = localStorage.getItem("tn-bus-recent");
    return saved ? JSON.parse(saved) : [];
  });
  const [savedRoutes, setSavedRoutes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("tn-bus-favorites");
    return new Set(saved ? JSON.parse(saved) : []);
  });
  const [currentSearch, setCurrentSearch] = useState<{ from: string; to: string } | null>(null);

  const handleSearch = useCallback(
    (fromId: string, toId: string) => {
      const buses = findBuses(fromId, toId);
      setResults(buses);
      setCurrentSearch({ from: fromId, to: toId });

      // Save to recent
      const newRecent: RecentSearch = { fromId, toId, timestamp: Date.now() };
      const updated = [newRecent, ...recentSearches.filter((s) => !(s.fromId === fromId && s.toId === toId))].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("tn-bus-recent", JSON.stringify(updated));
    },
    [recentSearches]
  );

  const handleSaveRoute = useCallback(
    (bus: BusRoute) => {
      const newSaved = new Set(savedRoutes);
      if (newSaved.has(bus.id)) {
        newSaved.delete(bus.id);
      } else {
        newSaved.add(bus.id);
      }
      setSavedRoutes(newSaved);
      localStorage.setItem("tn-bus-favorites", JSON.stringify([...newSaved]));
    },
    [savedRoutes]
  );

  const handleRecentSelect = (fromId: string, toId: string) => {
    handleSearch(fromId, toId);
  };

  const getStopName = (id: string) => {
    const stop = stops.find((s) => s.id === id);
    return stop ? (lang === "ta" ? stop.nameTa : stop.nameEn) : id;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">{t.app.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => navigate("/favorites")}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={t.nav.favorites}
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={t.nav.profile}
            >
              <User className="h-4 w-4" />
            </button>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
              aria-label={t.nav.logout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-lg py-6">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">
            {lang === "ta" ? "வணக்கம்" : "Hello"}, {user?.name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">{t.app.tagline}</p>
        </div>

        {/* Search form */}
        <SearchForm onSearch={handleSearch} />

        {/* Recent searches */}
        {!results && (
          <RecentSearches searches={recentSearches} onSelect={handleRecentSelect} />
        )}

        {/* Results */}
        {results !== null && (
          <>
            {currentSearch && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setResults(null)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  ← {t.common.back}
                </button>
                <span className="text-xs text-muted-foreground">
                  {getStopName(currentSearch.from)} → {getStopName(currentSearch.to)}
                </span>
              </div>
            )}
            <BusResults
              buses={results}
              onSaveRoute={handleSaveRoute}
              savedRouteIds={savedRoutes}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
