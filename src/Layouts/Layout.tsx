import { useState } from "react";
import CharactersPage from "../pages/CharactersPage";
import { useParams, useNavigate } from "react-router-dom";
import CharacterDetailPage from "../pages/CharacterDetailPage";
import { useCharacters } from "../hooks/useCharacters";

/**
 * Layout component for the character browser application.
 * 
 * - Renders a split view on desktop: character list pane and a detail pane.
 * - On mobile, only one pane is visible at a time (either list or detail).
 * - Handles character selection, starring/un-starring, navigation, and state transitions.
 */
const Layout = () => {
  // Obtain character ID from route params (if present)
  const { id } = useParams();
  const navigate = useNavigate();
  
  /**
   * Custom hook to manage fetching characters, searching, filtering, pagination, etc.
   * Returns character data, loading/error states, and manipulation callbacks.
   */
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

  /**
   * selectedCharacterId: The currently selected character (by ID), 
   * initialized from the URL param if present.
   */
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    id ? parseInt(id) : null
  );

  /**
   * starredIds: Set of starred character IDs.
   */
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());

  /**
   * Handler for selecting a character.
   * - Updates selection state.
   * - On desktop, updates browser URL via history API without page reload.
   * - On mobile, uses react-router navigate.
   * @param characterId The selected character's ID
   */
  const handleSelectCharacter = (characterId: number) => {
    setSelectedCharacterId(characterId);
    // On desktop, update URL without navigation to allow preview panel update
    if (window.innerWidth >= 1024) {
      window.history.pushState({}, "", `/character/${characterId}`);
    } else {
      navigate(`/character/${characterId}`);
    }
  };

  /**
   * Handler for returning from the detail view to the main list.
   * - Clears the current selection.
   * - Navigates to the main list route.
   */
  const handleBack = () => {
    setSelectedCharacterId(null);
    navigate("/");
  };

  /**
   * Handler for toggling a character as starred/unstarred.
   * @param id The character's ID
   */
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

  // Locate the currently selected character object by ID (if any)
  const selectedCharacter = selectedCharacterId
    ? characters.find((char) => char.id === selectedCharacterId)
    : null;

  // ------------- UI State Handling (Loading/Error/Content) -------------

  // Render loading spinner while character data is loading
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

  // Render error state if data fetching failed
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

  // ------------- Main Layout Rendering -------------

  return (
    <div className="lg:grid lg:grid-cols-[375px_1fr] lg:h-screen lg:overflow-hidden">
      {/* Sidebar/List: Always visible on desktop; on mobile, only when NO character is selected */}
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

      {/* Detail pane: Only visible when a character is selected */}
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
