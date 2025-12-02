import type { CharacterInterface, CharactersResponse } from "../../interfaces/Character";
import { rickAndMortyClient } from "../graphql";
import { GET_CHARACTERS_QUERY, GET_CHARACTER_BY_ID_QUERY } from "./character.queries";

interface CharacterFilter {
  name?: string;
  status?: string;
  species?: string;
  type?: string;
  gender?: string;
}

interface GetCharactersOptions {
  page?: number;
  filter?: CharacterFilter;
}

/**
 * Service para manejar operaciones relacionadas con personajes
 */
class CharacterService {
  /**
   * Obtiene personajes con paginación y filtros opcionales
   * Soporta tanto navegación normal como búsqueda
   */
  async getCharacters(options: GetCharactersOptions = {}): Promise<CharactersResponse> {
    const { page = 1, filter } = options;

    try {
      const data = await rickAndMortyClient.request<{
        characters: CharactersResponse;
      }>(GET_CHARACTERS_QUERY, { page, filter: filter || undefined });

      return data.characters;
    } catch (error) {
      console.error("Error fetching characters:", error);
      throw error;
    }
  }

  /**
   * Obtiene un personaje por su ID
   */
  async getCharacterById(id: number): Promise<CharacterInterface> {
    try {
      const data = await rickAndMortyClient.request<{
        character: CharacterInterface;
      }>(GET_CHARACTER_BY_ID_QUERY, { id: id.toString() });

      return data.character;
    } catch (error) {
      console.error(`Error fetching character ${id}:`, error);
      throw error;
    }
  }
}

// Exportar una instancia única (singleton)
export const characterService = new CharacterService();

// Exportar tipos
export type { CharacterFilter, GetCharactersOptions };

