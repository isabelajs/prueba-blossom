import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

interface ResumenCardProps {
  id?: number;
  title: string;
  description: string;
  imageUrl?: string;
  isStarred?: boolean;
  onToggleStar?: (id: number) => void;
  className?: string;
}

export default function ResumenCard({
  id,
  title,
  description,
  imageUrl,
  isStarred = false,
  onToggleStar,
  className = "",
}: ResumenCardProps) {
  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleStar && id !== undefined) {
      onToggleStar(id);
    }
  };

  return (
    <Link
      to={id ? `/character/${id}` : "#"}
      className={`flex items-center gap-4 py-4 hover:bg-gray-50 transition-colors duration-200 ${className}`}
    >
      {/* Avatar */}
      {imageUrl && (
        <div className="shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base leading-6 font-semibold text-gray-900 truncate">
          {title}
        </h3>
        <p className="text-base leading-6 font-normal text-gray-500">{description}</p>
      </div>

      {/* Star Icon */}
      {onToggleStar && id !== undefined && (
        <button
          onClick={handleStarClick}
          className="shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={isStarred ? "Unstar character" : "Star character"}
        >
          {isStarred ? (
            <AiFillHeart className="text-secondary-600" size={24} />
          ) : (
            <AiOutlineHeart className="text-gray-300" size={24} />
          )}
        </button>
      )}
    </Link>
  );
}


