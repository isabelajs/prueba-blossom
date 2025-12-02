import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { CharacterInterface } from "../interfaces/Character";

/**
 * Props for useCharactersPage hook.
 */
interface UseCharactersPageProps {
  /**
   * Array of character objects to display.
   */
  characters: CharacterInterface[];
  /**
   * Set containing IDs of starred characters (marked by the user).
   */
  starredIds: Set<number>;
  /**
   * Function to call when a search is performed.
   * @param query - Search query string.
   */
  onSearch: (query: string) => void;
  /**
   * Function to call when filters (requiring server call) change.
   * @param filter - Object describing the filter (e.g. by species, status).
   */
  onFilterChange: (filter: { species?: string; status?: string }) => void;
  /**
   * Optional callback for when a character entry is clicked/selected (desktop).
   * @param id - ID of the character selected.
   */
  onSelectCharacter?: (id: number) => void;
}

/**
 * The shape of the return value from useCharactersPage.
 */
interface UseCharactersPageReturn {
  /**
   * Array containing locally-filtered characters based on all current filters (deduplicated).
   */
  filteredCharacters: CharacterInterface[];
  /**
   * Array of characters that are starred (subset of filteredCharacters).
   */
  starredCharacters: CharacterInterface[];
  /**
   * Array of characters that are NOT starred (subset of filteredCharacters).
   */
  regularCharacters: CharacterInterface[];
  /**
   * Whether the filter UI panel is currently open.
   */
  isFilterOpen: boolean;
  /**
   * Function to control filter UI panel open/close state.
   */
  setIsFilterOpen: (open: boolean) => void;
  /**
   * Handler for search actions, passes the value up.
   */
  handleSearch: (value: string) => void;
  /**
   * Handler to open the filters panel.
   */
  handleFilter: () => void;
  /**
   * Handler to apply selected filters (from the filter UI overlay).
   * Also triggers relevant filter actions (server/local).
   */
  handleApplyFilters: (filters: {
    characterType: "all" | "starred" | "others";
    species: "all" | "human" | "alien";
  }) => void;
  /**
   * Handler for when a character entry is clicked. Handles navigation or selection, depending on environment.
   */
  handleCharacterClick: (id: number, e: React.MouseEvent) => void;
  /**
   * Whether there are results after local filtering.
   */
  hasLocalResults: boolean;
  /**
   * Whether any local character type filter (starred/others) is currently active.
   */
  isLocalFilterActive: boolean;
  /**
   * The current set of applied filters, for syncing with filter UI state.
   */
  currentFilters: {
    characterType: "all" | "starred" | "others";
    species: "all" | "human" | "alien";
  };
}

/**
 * Custom hook to manage all CharactersPage UI logic.
 * Separates filtering, search, navigation logic from view code.
 *
 * - Handles local filtering (starred, others, all).
 * - Deduplicates characters by ID.
 * - Syncs and applies server filters (species, etc).
 * - Maintains starred and regular lists for efficient (split) rendering.
 * - Handles search input.
 * - Handles character click logic (desktop vs. mobile).
 *
 * @param {UseCharactersPageProps} props
 * @returns {UseCharactersPageReturn}
 */
export const useCharactersPage = ({
  characters,
  starredIds,
  onSearch,
  onFilterChange,
  onSelectCharacter,
}: UseCharactersPageProps): UseCharactersPageReturn => {
  const navigate = useNavigate();

  /**
   * State to control whether the filter UI is open or closed.
   */
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /**
   * State for local (client-only) filter regarding character type:
   * - "all": Show all characters
   * - "starred": Show only starred
   * - "others": Show only non-starred
   */
  const [localFilter, setLocalFilter] = useState<"all" | "starred" | "others">("all");

  /**
   * State storing the latest server/filter fields that affect server results.
   * Used for syncing UI and avoiding unnecessary server calls.
   */
  const [currentServerFilters, setCurrentServerFilters] = useState<{ species?: string }>({});

  /**
   * Returns an array of unique characters, filtered locally by the selected type (all/starred/others).
   * Always deduplicates by character ID to ensure consistency.
   */
  const filteredCharacters = useMemo(() => {
    // Deduplicate by ID (keeps last occurrence)
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

  /**
   * Returns only the starred (favorited) characters for display.
   */
  const starredCharacters = useMemo(
    () => filteredCharacters.filter((char) => starredIds.has(char.id)),
    [filteredCharacters, starredIds]
  );

  /**
   * Returns only the regular (non-starred) characters for display.
   */
  const regularCharacters = useMemo(
    () => filteredCharacters.filter((char) => !starredIds.has(char.id)),
    [filteredCharacters, starredIds]
  );

  /**
   * Calls the provided onSearch handler with the input value.
   * Used as the callback for the search input.
   *
   * @param value - The search string to forward to the parent.
   */
  const handleSearch = useCallback(
    (value: string) => {
      onSearch(value);
    },
    [onSearch]
  );

  /**
   * Opens the filter UI panel.
   */
  const handleFilter = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  /**
   * Applies both local (starred/others) and server-side (species) filters.
   * - Updates local filter state immediately for UI reactivity.
   * - Only triggers server filter if values have changed to avoid unnecessary calls.
   *
   * @param filters - Selected filter values from the UI.
   */
  const handleApplyFilters = useCallback(
    (filters: {
      characterType: "all" | "starred" | "others";
      species: "all" | "human" | "alien";
    }) => {
      // Update local filter for type (applied instantly in UI)
      setLocalFilter(filters.characterType);

      // Build server filter payload for e.g. species
      const serverFilters: { species?: string } = {};
      if (filters.species !== "all") {
        serverFilters.species = filters.species;
      }

      // Only notify parent/server if filter has changed
      const filtersChanged =
        JSON.stringify(serverFilters) !== JSON.stringify(currentServerFilters);
      if (filtersChanged) {
        setCurrentServerFilters(serverFilters);
        onFilterChange(serverFilters);
      }
    },
    [currentServerFilters, onFilterChange]
  );

  /**
   * Handler for character card click interaction.
   * - Ignores clicks that originate from inside a button (e.g. star/unstar).
   * - On 'desktop', calls onSelectCharacter to update the preview panel (no navigation).
   * - On 'mobile', navigates to the character detail route.
   *
   * @param id - The character's ID
   * @param e - The click mouse event
   */
  const handleCharacterClick = useCallback(
    (id: number, e: React.MouseEvent) => {
      // Ignore if click originated from inside a button (e.g. star icon)
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }

      if (onSelectCharacter) {
        // Desktop: update detail panel in place without navigation
        onSelectCharacter(id);
      } else {
        // Mobile: navigate to details page
        navigate(`/character/${id}`);
      }
    },
    [onSelectCharacter, navigate]
  );

  /**
   * Returns true if the locally-filtered list has any results, false otherwise.
   */
  const hasLocalResults = filteredCharacters.length > 0;

  /**
   * Returns true if any local character-type filter (starred or others) is currently applied.
   */
  const isLocalFilterActive = localFilter !== "all";

  /**
   * Returns the current active filters to sync with Filter UI state.
   */
  const currentFilters = {
    characterType: localFilter,
    species: (currentServerFilters.species || "all") as "all" | "human" | "alien",
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
