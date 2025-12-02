interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner = ({ text = "Loading more..." }: LoadingSpinnerProps) => {
  return (
    <div className="flex justify-center items-center gap-2 py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      <span className="text-gray-500 text-sm">{text}</span>
    </div>
  );
};

export default LoadingSpinner;

