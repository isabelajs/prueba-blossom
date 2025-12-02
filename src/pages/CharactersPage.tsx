import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CharacterInterface } from "../interfaces/Character";
import Search from "../components/Search";
import ResumenCard from "../components/ResumenCard";

interface CharactersPageProps {
  characters: CharacterInterface[];
  starredIds: Set<number>;
  onSelectCharacter?: (id: number) => void;
  onToggleStar: (id: number) => void;
  selectedCharacterId?: number | null;
}

const CharactersPage = ({ 
  characters, 
  starredIds, 
  onSelectCharacter, 
  onToggleStar,
  selectedCharacterId 
}: CharactersPageProps) => {
  const [filteredCharacters, setFilteredCharacters] = useState<CharacterInterface[]>(characters);
  const navigate = useNavigate();

  // Update filtered characters when characters prop changes
  useEffect(() => {
    setFilteredCharacters(characters);
  }, [characters]);

  const handleSearch = (value: string) => {
    const filtered = characters.filter((character) =>
      character.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCharacters(filtered);
  };

  const handleFilter = () => {
    console.log("Filter button clicked");
    // Aquí puedes agregar la lógica de filtros
  };

  const handleCharacterClick = (id: number, e: React.MouseEvent) => {
    // Prevenir navegación si es click en el botón de favoritos
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (onSelectCharacter) {
      // Desktop: actualiza el detalle sin navegar
      onSelectCharacter(id);
    } else {
      // Mobile: navega a otra página
      navigate(`/character/${id}`);
    }
  };

  const starredCharacters = filteredCharacters.filter((char) =>
    starredIds.has(char.id)
  );
  const regularCharacters = filteredCharacters.filter(
    (char) => !starredIds.has(char.id)
  );

  return (
    <div className="space-y-6 px-6 py-10 lg:px-4">
      <h1 className="text-2xl font-bold text-gray-800">Rick and Morty List</h1>

      <Search onSearch={handleSearch} onFilter={handleFilter} />

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
                key={character.id}
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
              key={character.id}
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
    </div>
  );
};

export default CharactersPage;
