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

  return (
    <div className="space-y-6 px-6 py-10 lg:px-4">
      <h1 className="text-2xl font-bold text-gray-800">Rick and Morty List</h1>

      {/* Search wrapper con position relative para el dropdown */}
      <div className="relative">
        <Search 
          onSearch={handleSearch} 
          onFilter={handleFilter}
          isFilterOpen={isFilterOpen}
        />
        
        {/* Filter Component - dropdown debajo del search */}
        {isFilterOpen && (
          <FilterComponent 
            key={`${currentFilters.characterType}-${currentFilters.species}`}
            onClose={() => {setIsFilterOpen(false)}}
            onApplyFilters={handleApplyFilters}
            initialFilters={currentFilters}
          />
        )}
      </div>

      {/* Starred Characters Section */}
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
                  selectedCharacterId === character.id ? 'bg-primary-100 rounded-lg mt-2' : 'bg-white hover:bg-primary-50'
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
                    starredCharacters[starredCharacters.length - 1].id !==
                    character.id
                      ? "border-b border-gray-100"
                      : ""
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Characters Section */}
      <section>
        <div className="py-4 border-b border-gray-200">
          <h2 className="text-xs leading-4 font-semibold tracking-wider uppercase text-gray-500">
            Characters ( {regularCharacters.length} )
          </h2>
        </div>
        <div className=" overflow-hidden">
          {regularCharacters.map((character) => (
            <div
              key={`regular-${character.id}`}
              onClick={(e) => handleCharacterClick(character.id, e)}
              className={`cursor-pointer transition-colors ${
                selectedCharacterId === character.id ? 'bg-primary-100 rounded-lg mt-2' : 'bg-white hover:bg-primary-50'
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
                  regularCharacters[regularCharacters.length - 1].id !==
                  character.id
                    ? "border-b border-gray-100"
                    : ""
                }
              />
            </div>
          ))}
        </div>
        {regularCharacters.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No characters found
          </div>
        )}
      </section>

      {/* Scroll Trigger para infinite scroll */}
      {hasNextPage && (
        <div ref={observerRef} className="py-4">
          {isLoadingMore && <LoadingSpinner />}
        </div>
      )}
    </div>
  );
};

export default CharactersPage;
