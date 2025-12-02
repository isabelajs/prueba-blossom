import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

export interface ButtonStarredProps {
  isStarred: boolean;
  onToggleStar: () => void;
  classNameButton?: string;
}

export default function ButtonStarred({
  isStarred,
  onToggleStar,
  classNameButton = "",
}: ButtonStarredProps) {
  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleStar();
  };
  return (
    <button
      onClick={handleStarClick}
      className={`shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors ${classNameButton}`}
      aria-label={isStarred ? "Unstar character" : "Star character"}
    >
      {isStarred ? (
        <AiFillHeart className="text-secondary-600" size={24} />
      ) : (
        <AiOutlineHeart className="text-gray-300" size={24} />
      )}
    </button>
  );
}
