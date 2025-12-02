import type { CharacterInterface } from "../interfaces/Character";
import Search from "../components/Search";
import ResumenCard from "../components/ResumenCard";
import FilterComponent from "../components/FilterComponent";
import LoadingSpinner from "../components/LoadingSpinner";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useCharactersPage } from "../hooks/useCharactersPage";

interface CharactersPageProps {
  characters: CharacterInterface[];
  starredIds: Set<number>;
  onSelectCharacter?: (id: number) => void;
  onToggleStar: (id: number) => void;
  selectedCharacterId?: number | null;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  onSearch: (query: string) => void;
  onFilterChange: (filter: { species?: string; status?: string }) => void;
}

const CharactersPage = ({ 
  characters, 
  starredIds, 
  onSelectCharacter, 
  onToggleStar,
  selectedCharacterId,
  onLoadMore,
  isLoadingMore,
  hasNextPage,
  onSearch,
  onFilterChange
}: CharactersPageProps) => {
  // Custom hook maneja toda la lógica
  const {
    starredCharacters,
    regularCharacters,
    isFilterOpen,
    setIsFilterOpen,
    handleSearch,
    handleFilter,
    handleApplyFilters,
    handleCharacterClick,
    isLocalFilterActive,
    currentFilters,
  } = useCharactersPage({
    characters,
    starredIds,
    onSearch,
    onFilterChange,
    onSelectCharacter,
  });

  // Intersection Observer para scroll infinito
  // IMPORTANTE: Cuando hay filtro local activo (starred/others), NO cargar más páginas
  // porque el filtro local solo funciona sobre datos ya cargados.
  // Solo cargar más páginas cuando NO hay filtro local activo.
  const shouldEnableObserver = 
    hasNextPage &&           // Hay más páginas disponibles
    !isLoadingMore &&        // No está cargando actualmente
    !isLocalFilterActive;    // NO hay filtro local activo (starred/others)
  
  const { ref: observerRef } = useIntersectionObserver({
    onIntersect: onLoadMore,
    enabled: shouldEnableObserver,
    threshold: 0.1,
  });

  /**
   * Main render of the CharactersPage component.
   *
   * Provides a complete UI for browsing, searching, filtering,
   * and starring characters.
   *
   * - The Search bar allows searching by keyword/name.
   * - The filter dropdown shows advanced filtering options (species, etc).
   * - Starred characters are shown in a dedicated section (if any are starred).
   * - The main characters list shows all matching characters (excluding starred, if present).
   * - Implements infinite scrolling: when the user reaches the bottom of the regular list,
   *   loads more pages (unless a local filter is active).
   * - Shows an empty-state message if no characters appear after filtering/searching.
   * - Each character entry allows becoming "starred" or unstarred, and can be selected.
   * 
   * Props, handler hooks, and filtering logic are managed externally and injected here from useCharactersPage.
   */
  return (
    <div className="space-y-6 px-6 py-10 lg:px-4">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800">
        Rick and Morty List
      </h1>

      {/* Search bar and filter dropdown container.
          The filter dropdown appears below the search bar when open.
      */}
      <div className="relative">
        {/* Search input and filter button.
            - handleSearch: Callback for search term changes.
            - handleFilter: Opens the filter dropdown.
            - isFilterOpen: Boolean, shows the dropdown if true.
        */}
        <Search 
          onSearch={handleSearch} 
          onFilter={handleFilter}
          isFilterOpen={isFilterOpen}
        />

        {/* FilterComponent appears as a dropdown below the search bar.
            - key uses the filter state to ensure rerendering on filter reset.
            - onClose: Callback to close the dropdown.
            - onApplyFilters: Applies selected filters.
            - initialFilters: Current filter state.
        */}
        {isFilterOpen && (
          <FilterComponent 
            key={`${currentFilters.characterType}-${currentFilters.species}`}
            onClose={() => { setIsFilterOpen(false); }}
            onApplyFilters={handleApplyFilters}
            initialFilters={currentFilters}
          />
        )}
      </div>

      {/* Starred Characters Section
          - Displays only if there are any starredCharacters.
          - Each entry can be unstarred, and also selected (highlight).
      */}
      {starredCharacters.length > 0 && (
        <section>
          <div className="py-4 border-b border-gray-200">
            <h2 className="text-xs leading-4 font-semibold tracking-wider uppercase text-gray-500">
              Starred Characters ( {starredCharacters.length} )
            </h2>
          </div>
          <div className="overflow-hidden">
            {starredCharacters.map((character) => (
              <div
                key={`starred-${character.id}`}
                onClick={(e) => handleCharacterClick(character.id, e)}
                className={`cursor-pointer transition-colors ${
                  selectedCharacterId === character.id
                    ? 'bg-primary-100 rounded-lg mt-2'
                    : 'bg-white hover:bg-primary-50'
                }`}
              >
                <ResumenCard
                  id={character.id}
                  title={character.name}
                  description={character.species}
                  imageUrl={character.image}
                  isStarred={true}
                  onToggleStar={onToggleStar}
                  className={
                    starredCharacters[starredCharacters.length - 1].id !== character.id
                      ? "border-b border-gray-100"
                      : ""
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Characters List Section
          - Displays all regular characters (not starred).
          - Each can be starred, selected, or hovered.
          - Shows a message if no regular characters are found.
      */}
      <section>
        <div className="py-4 border-b border-gray-200">
          <h2 className="text-xs leading-4 font-semibold tracking-wider uppercase text-gray-500">
            Characters ( {regularCharacters.length} )
          </h2>
        </div>
        <div className="overflow-hidden">
          {regularCharacters.map((character) => (
            <div
              key={`regular-${character.id}`}
              onClick={(e) => handleCharacterClick(character.id, e)}
              className={`cursor-pointer transition-colors ${
                selectedCharacterId === character.id
                  ? 'bg-primary-100 rounded-lg mt-2'
                  : 'bg-white hover:bg-primary-50'
              }`}
            >
              <ResumenCard
                id={character.id}
                title={character.name}
                description={character.species}
                imageUrl={character.image}
                isStarred={false}
                onToggleStar={onToggleStar}
                className={
                  regularCharacters[regularCharacters.length - 1].id !== character.id
                    ? "border-b border-gray-100"
                    : ""
                }
              />
            </div>
          ))}
        </div>
        {/* Display when there are no characters after filtering/searching. */}
        {regularCharacters.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No characters found
          </div>
        )}
      </section>

      {/* Infinite Scroll Loader
          - Ref for the intersection observer is attached to this div.
          - Only displayed if there are more pages to load (hasNextPage).
          - Shows a loading spinner if isLoadingMore is true.
          - Loads more pages upon being visible (observer logic).
      */}
      {hasNextPage && (
        <div ref={observerRef} className="py-4">
          {isLoadingMore && <LoadingSpinner />}
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
