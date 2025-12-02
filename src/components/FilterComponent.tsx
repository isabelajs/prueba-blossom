import { useEffect, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { GoArrowLeft } from "react-icons/go";

interface FilterComponentProps {
  onClose: () => void;
  onApplyFilters: (filters: {
    characterType: "all" | "starred" | "others";
    species: "all" | "human" | "alien";
  }) => void;
  initialFilters?: {
    characterType: "all" | "starred" | "others";
    species: "all" | "human" | "alien";
  };
}

export default function FilterComponent({
  onClose,
  onApplyFilters,
  initialFilters = { characterType: "all", species: "all" },
}: FilterComponentProps) {
  // Block body scroll on mobile when filter is open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    // Initial check
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, []);

  const [characterType, setCharacterType] = useState<
    "all" | "starred" | "others"
  >(initialFilters.characterType);
  const [species, setSpecies] = useState<"all" | "human" | "alien">(
    initialFilters.species
  );

  /**
   * Reference to the filter panel container.
   * The useClickOutside hook calls onClose when a click occurs outside this div.
   */
  const filterRef = useClickOutside<HTMLDivElement>(onClose);

  /**
   * Applies the currently selected filters by calling the onApplyFilters callback
   * with the selected characterType and species. After applying the filters,
   * it closes the filter panel by invoking the onClose callback.
   */
  const handleApplyFilters = () => {
    onApplyFilters({ characterType, species });
    onClose();
  };

  return (
    <>
      {/* Backdrop - only mobile */}
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden cursor-pointer"
        onClick={onClose}
      />

      {/* Filter Panel - dropdown debajo del search */}
      <div
        ref={filterRef}
        className="fixed inset-x-0 bottom-0 h-[95vh] bg-white z-50 flex flex-col rounded-t-2xl lg:h-auto lg:absolute lg:inset-auto lg:top-full lg:left-0 lg:right-0 lg:mt-2 lg:rounded-lg lg:shadow-xl lg:max-h-[500px]"
      >
        {/* Content */}
        <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex  items-center">
            <button onClick={onClose} className="cursor-pointer">
              <GoArrowLeft className="text-primary-600" size={24} />
            </button>
            <h2 className="text-base leading-6 font-semibold text-gray-800 text-center flex-1">
              Filters
            </h2>
          </div>
          {/* Characters Filter */}
          <div>
            <h3 className="text-base leading-6 font-medium text-gray-500 mb-3">
              Characters
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setCharacterType("all")}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    characterType === "all"
                      ? "bg-primary-100 text-primary-600"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                All
              </button>
              <button
                onClick={() => setCharacterType("starred")}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    characterType === "starred"
                      ? "bg-primary-100 text-primary-600"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                Starred
              </button>
              <button
                onClick={() => setCharacterType("others")}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    characterType === "others"
                      ? "bg-primary-100 text-primary-600"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                Others
              </button>
            </div>
          </div>

          {/* Species Filter */}
          <div>
            <h3 className="text-base leading-6 font-medium text-gray-500 mb-3">Species</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setSpecies("all")}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    species === "all"
                      ? "bg-primary-100 text-primary-600"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                All
              </button>
              <button
                onClick={() => setSpecies("human")}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    species === "human"
                      ? "bg-primary-100 text-primary-600"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                Human
              </button>
              <button
                onClick={() => setSpecies("alien")}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    species === "alien"
                      ? "bg-primary-100 text-primary-600"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                Alien
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Apply Button */}
        <div className="shrink-0 p-6 border-t border-gray-200 bg-white">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Filter
          </button>
        </div>
      </div>
    </>
  );
}
