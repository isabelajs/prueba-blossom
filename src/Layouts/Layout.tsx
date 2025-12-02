import { useState } from "react";
import CharactersPage from "../pages/CharactersPage";
import { useParams, useNavigate } from "react-router-dom";
import CharacterDetailPage from "../pages/CharacterDetailPage";
import { useCharacters } from "../hooks/useCharacters";

const Layout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Custom hook maneja toda la lógica de personajes, paginación y búsqueda
  const {
    characters,
    loading,
    error,
    loadNextPage,
    isLoadingMore,
    hasNextPage,
    searchCharacters,
    applyFilters,
  } = useCharacters();

  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    id ? parseInt(id) : null
  );
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());

  const handleSelectCharacter = (characterId: number) => {
    setSelectedCharacterId(characterId);
    // Actualizar la URL en desktop sin recargar la página
    if (window.innerWidth >= 1024) {
      window.history.pushState({}, "", `/character/${characterId}`);
    } else {
      navigate(`/character/${characterId}`);
    }
  };

  const handleBack = () => {
    setSelectedCharacterId(null);
    navigate("/");
  };

  const handleToggleStar = (id: number) => {
    setStarredIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get selected character
  const selectedCharacter = selectedCharacterId
    ? characters.find((char) => char.id === selectedCharacterId)
    : null;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading characters...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error loading characters</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[375px_1fr] lg:h-screen lg:overflow-hidden">
      {/* Lista - Siempre visible en desktop, solo visible en mobile cuando no hay selección */}
      <div
        className={`
        ${selectedCharacterId ? "hidden lg:block" : "block"} 
        lg:overflow-y-auto lg:border-r lg:border-gray-200 
      `}
      >
        <CharactersPage
          characters={characters}
          starredIds={starredIds}
          onSelectCharacter={handleSelectCharacter}
          onToggleStar={handleToggleStar}
          selectedCharacterId={selectedCharacterId}
          onLoadMore={loadNextPage}
          isLoadingMore={isLoadingMore}
          hasNextPage={hasNextPage}
          onSearch={searchCharacters}
          onFilterChange={applyFilters}
        />
      </div>

      {/* Detalle - Solo visible cuando hay selección */}
      <div
        className={`
        ${!selectedCharacterId ? "hidden" : "block"}
        lg:overflow-y-auto lg:shadow-[0px_4px_60px_0px_rgba(0,0,0,0.05)]
      `}
      >
        {selectedCharacter ? (
          <CharacterDetailPage
            character={selectedCharacter}
            isStarred={starredIds.has(selectedCharacter.id)}
            onToggleStar={handleToggleStar}
            showBackButton={true}
            onBack={handleBack}
          />
        ) : (
          <div className="hidden lg:flex items-center justify-center h-full text-gray-400">
            <p className="text-lg">Select a character to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
