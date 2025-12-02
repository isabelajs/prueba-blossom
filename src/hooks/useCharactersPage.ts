import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { CharacterInterface } from "../interfaces/Character";

interface UseCharactersPageProps {
  characters: CharacterInterface[];
  starredIds: Set<number>;
  onSearch: (query: string) => void;
  onFilterChange: (filter: { species?: string; status?: string }) => void;
  onSelectCharacter?: (id: number) => void;
}

interface UseCharactersPageReturn {
  filteredCharacters: CharacterInterface[];
  starredCharacters: CharacterInterface[];
  regularCharacters: CharacterInterface[];
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  handleSearch: (value: string) => void;
  handleFilter: () => void;
  handleApplyFilters: (filters: {
    characterType: "all" | "starred" | "others";
    species: "all" | "human" | "alien";
  }) => void;
  handleCharacterClick: (id: number, e: React.MouseEvent) => void;
  hasLocalResults: boolean;
  isLocalFilterActive: boolean;
  currentFilters: {
    characterType: "all" | "starred" | "others";
    species: "all" | "human" | "alien";
  };
}

/**
 * Hook para manejar la lógica de CharactersPage
 * Separa lógica de presentación
 */
export const useCharactersPage = ({
  characters,
  starredIds,
  onSearch,
  onFilterChange,
  onSelectCharacter,
}: UseCharactersPageProps): UseCharactersPageReturn => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilter, setLocalFilter] = useState<"all" | "starred" | "others">(
    "all"
  );
  const [currentServerFilters, setCurrentServerFilters] = useState<{
    species?: string;
  }>({});

  // Filtrado local (starred/others) con deduplicación por ID
  const filteredCharacters = useMemo(() => {
    // Primero deduplicar por ID
    const uniqueCharacters = Array.from(
      new Map(characters.map((char) => [char.id, char])).values()
    );

    if (localFilter === "starred") {
      return uniqueCharacters.filter((char) => starredIds.has(char.id));
    } else if (localFilter === "others") {
      return uniqueCharacters.filter((char) => !starredIds.has(char.id));
    }
    return uniqueCharacters;
  }, [characters, localFilter, starredIds]);

  // Separar en starred y regulares para renderizado (ya deduplicados)
  const starredCharacters = useMemo(
    () => filteredCharacters.filter((char) => starredIds.has(char.id)),
    [filteredCharacters, starredIds]
  );

  const regularCharacters = useMemo(
    () => filteredCharacters.filter((char) => !starredIds.has(char.id)),
    [filteredCharacters, starredIds]
  );

  // Handlers
  const handleSearch = useCallback(
    (value: string) => {
      onSearch(value);
    },
    [onSearch]
  );

  const handleFilter = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  const handleApplyFilters = useCallback(
    (filters: {
      characterType: "all" | "starred" | "others";
      species: "all" | "human" | "alien";
    }) => {
      // Filtro local (starred/others) - INSTANTÁNEO
      setLocalFilter(filters.characterType);

      // Filtros del servidor (species)
      const serverFilters: { species?: string } = {};
      if (filters.species !== "all") {
        serverFilters.species = filters.species;
      }

      // Solo llamar al servidor si los filtros cambiaron
      const filtersChanged =
        JSON.stringify(serverFilters) !== JSON.stringify(currentServerFilters);
      if (filtersChanged) {
        setCurrentServerFilters(serverFilters);
        onFilterChange(serverFilters);
      }
    },
    [currentServerFilters, onFilterChange]
  );

  const handleCharacterClick = useCallback(
    (id: number, e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }

      if (onSelectCharacter) {
        // Desktop: actualiza el detalle sin navegar
        onSelectCharacter(id);
      } else {
        // Mobile: navega a otra página
        navigate(`/character/${id}`);
      }
    },
    [onSelectCharacter, navigate]
  );

  const hasLocalResults = filteredCharacters.length > 0;
  const isLocalFilterActive = localFilter !== "all";

  // Valores actuales de los filtros para sincronizar con FilterComponent
  const currentFilters = {
    characterType: localFilter,
    species: (currentServerFilters.species || "all") as
      | "all"
      | "human"
      | "alien",
  };

  return {
    filteredCharacters,
    starredCharacters,
    regularCharacters,
    isFilterOpen,
    setIsFilterOpen,
    handleSearch,
    handleFilter,
    handleApplyFilters,
    handleCharacterClick,
    hasLocalResults,
    isLocalFilterActive,
    currentFilters,
  };
};
