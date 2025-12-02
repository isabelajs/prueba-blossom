import { useState, useEffect, useCallback, useRef } from "react";
import type { CharacterInterface } from "../interfaces/Character";
import { characterService } from "../services/character";
import type { CharacterFilter } from "../services/character";
import { searchCache } from "../services/cache";
import { debounce, cleanObject } from "../helpers";

interface UseCharactersReturn {
  characters: CharacterInterface[];
  loading: boolean;
  error: string | null;
  loadNextPage: () => void;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  searchCharacters: (query: string) => void;
  applyFilters: (filters: Partial<CharacterFilter>) => void;
}

/**
 * Custom hook para manejar la lógica de personajes con paginación infinita y búsqueda
 * Unificado: usa el mismo endpoint con filtros opcionales
 */
export const useCharacters = (): UseCharactersReturn => {
  const [characters, setCharacters] = useState<CharacterInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtro activo (null = sin filtro)
  const [activeFilter, setActiveFilter] = useState<CharacterFilter | null>(
    null
  );

  // Ref para evitar loop infinito
  const isInitialLoadRef = useRef(true);

  const hasNextPage = currentPage < totalPages;

  // Generar cache key
  const getCacheKey = (page: number, filter: CharacterFilter | null) => {
    if (!filter || Object.keys(filter).length === 0) {
      return `characters:page:${page}`;
    }
    return `characters:${JSON.stringify(filter)}:page:${page}`;
  };

  const loadData = useCallback(
    async (page: number, filter: CharacterFilter | null) => {
      const cacheKey = getCacheKey(page, filter);

      // Check cache
      const cached = searchCache.get<CharacterInterface[]>(cacheKey);
      if (cached) {
        console.log("📦 Cache HIT:", cacheKey);

        if (page === 1) {
          setCharacters(cached);
        } else {
          setCharacters((prev) => [...prev, ...cached]);
        }

        if (isInitialLoadRef.current) {
          setLoading(false);
          isInitialLoadRef.current = false;
        }
        return;
      }

      if (isInitialLoadRef.current) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await characterService.getCharacters({
          page,
          filter: filter || undefined,
        });

        const newCharacters = response.results;

        if (page === 1) {
          // Primera página: reemplazar
          setCharacters(newCharacters);
        } else {
          // Páginas siguientes: acumular y deduplicar por ID
          setCharacters((prev) => {
            const existingIds = new Set(prev.map((char) => char.id));
            const uniqueNewChars = newCharacters.filter(
              (char) => !existingIds.has(char.id)
            );
            return [...prev, ...uniqueNewChars];
          });
        }

        setCurrentPage(page);
        setTotalPages(response.info.pages);

        // Guardar en cache
        searchCache.set(cacheKey, newCharacters);
        setError(null);
      } catch (err) {
        console.error(`Error loading page ${page}:`, err);
        setError(
          err instanceof Error ? err.message : "Failed to load characters"
        );
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
        isInitialLoadRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    loadData(1, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    loadData(currentPage + 1, activeFilter);
  }, [currentPage, hasNextPage, isLoadingMore, activeFilter, loadData]);

  const cleanAndApplyFilters = useCallback(
    (newFilter: CharacterFilter) => {
      const cleanFilter = cleanObject(newFilter) as CharacterFilter;

      const finalFilter =
        Object.keys(cleanFilter).length > 0 ? cleanFilter : null;
      setActiveFilter(finalFilter);
      isInitialLoadRef.current = false;
      loadData(1, finalFilter);
    },
    [loadData]
  );

  const performSearch = useCallback(
    (query: string) => {
      const newFilter = {
        ...activeFilter,
        name: query.trim() || undefined,
      };
      cleanAndApplyFilters(newFilter);
    },
    [activeFilter, cleanAndApplyFilters]
  );

  const applyFilters = useCallback(
    (filters: Partial<CharacterFilter>) => {
      const newFilter = {
        ...activeFilter,
        ...filters,
      };
      cleanAndApplyFilters(newFilter);
    },
    [activeFilter, cleanAndApplyFilters]
  );

  // Debounced search
  const debouncedSearchRef = useRef(debounce(performSearch, 300));

  useEffect(() => {
    debouncedSearchRef.current = debounce(performSearch, 300);
  }, [performSearch]);

  const searchCharacters = useCallback((query: string) => {
    debouncedSearchRef.current(query);
  }, []);

  return {
    characters,
    loading,
    error,
    loadNextPage,
    isLoadingMore,
    hasNextPage,
    searchCharacters,
    applyFilters,
  };
};
