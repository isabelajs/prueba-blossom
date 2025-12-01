import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { PiSliders } from "react-icons/pi";

interface SearchProps {
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  placeholder?: string;
}

const Search = ({
  onSearch,
  onFilter,
  placeholder = "Search or filter results",
}: SearchProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div className=" flex items-center bg-gray-100 rounded-lg gap-2 h-[38px] px-3">
      {/* Icono de búsqueda */}
      <LuSearch className="text-gray-400" size={20} />

      {/* Input */}
      <input
        id="search-input"
        type="text"
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-gray-500 placeholder-gray-400 text-base placeholder:text-base placeholder:font-medium"
      />

      {/* Icono de filtros */}
      <button
        onClick={onFilter}
        aria-label="Filter options"
      >
        <PiSliders className="text-primary-600" size={24} />
      </button>
    </div>
  );
};

export default Search;
