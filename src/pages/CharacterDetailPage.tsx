
import { Link, useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import ButtonStarred from "../components/ButtonStarred";
import ResumenCard from "../components/ResumenCard";
import type { CharacterInterface } from "../interfaces/Character";



interface CharacterDetailPageProps {
  character: CharacterInterface;
  isStarred: boolean;
  onToggleStar: (id: number) => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const CharacterDetailPage = ({ 
  character,
  isStarred,
  onToggleStar,
  showBackButton = true,
  onBack
}: CharacterDetailPageProps) => {

  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const handleToggleStar = () => {
    onToggleStar(character.id);
  };


  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back button */}
      {showBackButton && (
        <div className="lg:hidden mb-4">
          {onBack ? (
            <button onClick={handleBackClick}>
              <GoArrowLeft className="text-primary-600" size={24} />
            </button>
          ) : (
            <Link to="/">
              <GoArrowLeft className="text-primary-600" size={24} />
            </Link>
          )}
        </div>
      )}

      {/* Avatar and Button Starred */}
      <div className="flex flex-col mt-4">
        <div className="relative w-fit">
          <img
            src={character.image}
            alt={`Avatar of ${character.name}`}
            title={character.name}
            className="w-[75px] h-[75px] rounded-full object-cover"
            loading="lazy"
            draggable={false}
          />

          <ButtonStarred
            isStarred={isStarred}
            onToggleStar={handleToggleStar}
            classNameButton="absolute bottom-0 right-[-15px] bg-white rounded-full w-8 h-8 flex items-center justify-center !p-0"
          />
        </div>
      </div>

      {/* Name */}
      <h1 className="text-2xl leading-8 font-bold text-gray-900 mt-2">
        {character.name}
      </h1>

      {/* Information */}
      <section className="mt-4">
        <ResumenCard
          title="Species"
          description={character.species}
          className="border-b border-gray-200"
        />
        <ResumenCard
          title="Status"
          description={character.status}
          className="border-b border-gray-200"
        />
        <ResumenCard
          title="Gender"
          description={character.gender}
          className="border-b border-gray-200"
        />
        <ResumenCard
          title="Origin"
          description={character.origin.name}
          className="border-b border-gray-200"
        />
        <ResumenCard
          title="Location"
          description={character.location.name}
          className="border-b border-gray-200"
        />
        <ResumenCard
          title="Episodes"
          description={`${character.episode.length} episodes`}
        />
      </section>
    </div>
  );
};

export default CharacterDetailPage;
