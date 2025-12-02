
import { Link } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import ButtonStarred from "../components/ButtonStarred";
import ResumenCard from "../components/ResumenCard";

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
  isStarred: boolean;
}

const CharacterDetailPage = (character: Character) => {
  const handleToggleStar = (id: number) => {
    console.log("Toggle star", id);
  };


  return (
    <div>
      {/* Back button */}
      <Link to="/">
        <GoArrowLeft className="text-primary-600" size={24} />
      </Link>

      {/* Avatar and Button Starred */}
      <div className="flex  flex-col mt-4">
        <div className="relative w-fit">
          <img
            src={character.image}
            alt={`Avatar of ${character.name}`}
            title={character.name}
            width={75}
            height={75}
            className=" rounded-full object-cover"
            loading="lazy"
            draggable={false}
          />

          <ButtonStarred
            isStarred={character.isStarred}
            onToggleStar={() => handleToggleStar(character.id)}
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
          title="Specie"
          description={character.species}
          className="border-b border-gray-200"
        />
        <ResumenCard
          title="Status"
          description={character.status}
          className="border-b border-gray-200"
        />
      </section>
    </div>
  );
};

export default CharacterDetailPage;
