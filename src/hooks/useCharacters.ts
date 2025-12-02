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
 * Custom hook to manage paginated and filterable character lists with infinite scroll.
 * Uses a single endpoint with optional filters, supports caching, and provides debounced search.
 *
 * @returns {UseCharactersReturn} API for loading, searching, and paginating characters
 */
export const useCharacters = (): UseCharactersReturn => {
  // Holds the list of currently fetched characters
  const [characters, setCharacters] = useState<CharacterInterface[]>([]);
  // Current page of pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Total number of pages available
  const [totalPages, setTotalPages] = useState(0);
  // Indicates whether the initial or fresh page is being loaded
  const [loading, setLoading] = useState(true);
  // Indicates whether an additional page is being loaded (for infinite scroll)
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Stores any fetch error message
  const [error, setError] = useState<string | null>(null);

  /**
   * Holds the current filter applied on character queries; `null` means no filter.
   */
  const [activeFilter, setActiveFilter] = useState<CharacterFilter | null>(null);

  /**
   * Used to detect initial mount and prevent infinite loops when setting page/filter state.
   */
  const isInitialLoadRef = useRef(true);

  /**
   * Boolean indicating if next page is available,
   * based on current and total page values.
   */
  const hasNextPage = currentPage < totalPages;

  /**
   * Generates a unique cache key based on page and filter.
   * Returns the key as a string.
   *
   * @param {number} page - The page number.
   * @param {CharacterFilter | null} filter - The active filter.
   */
  const getCacheKey = (page: number, filter: CharacterFilter | null) => {
    if (!filter || Object.keys(filter).length === 0) {
      return `characters:page:${page}`;
    }
    return `characters:${JSON.stringify(filter)}:page:${page}`;
  };

  /**
   * Loads characters for a given page and filter.
   * Uses cache if available. Updates state accordingly.
   *
   * @param {number} page - Page number to load.
   * @param {CharacterFilter | null} filter - Filter to apply.
   */
  const loadData = useCallback(
    async (page: number, filter: CharacterFilter | null) => {
      const cacheKey = getCacheKey(page, filter);

      // If cache contains data, use it immediately
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
          // On first page, replace character list
          setCharacters(newCharacters);
        } else {
          // On subsequent pages, append only new (deduplicated) items
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

        // Store fetched characters in cache
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

  /**
   * Loads the initial set of characters on mount (no filter, page 1).
   * Runs only once.
   */
  useEffect(() => {
    loadData(1, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Loads the next page of characters (for infinite scroll).
   * Won't do anything if at the end of results or already loading more.
   */
  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;
    loadData(currentPage + 1, activeFilter);
  }, [currentPage, hasNextPage, isLoadingMore, activeFilter, loadData]);

  /**
   * Applies a new filter set, resets to page 1, and reloads results.
   * Cleans filter object before applying.
   *
   * @param {CharacterFilter} newFilter - The filter to apply.
   */
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

  /**
   * Sets up a new search by applying a name filter.
   * Trims and ignores empty values.
   *
   * @param {string} query - The search input string.
   */
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

  /**
   * Updates additional filter parameters and re-applies filters.
   *
   * @param {Partial<CharacterFilter>} filters - The new filters to apply.
   */
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

  /**
   * Reference to a debounced version of performSearch.
   * Ensures search is only triggered after a short delay.
   */
  const debouncedSearchRef = useRef(debounce(performSearch, 300));

  // Update debounced search function if performSearch changes
  useEffect(() => {
    debouncedSearchRef.current = debounce(performSearch, 300);
  }, [performSearch]);

  /**
   * Triggers a debounced search based on the user's query input.
   *
   * @param {string} query - The query string to search for.
   */
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
