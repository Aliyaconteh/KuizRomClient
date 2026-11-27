import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Go back"
      title="Go back"
      className={`inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[5px] border-[var(--brand-accent-2)] bg-[var(--brand-secondary)] text-white shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] ${className}`}
    >
      <ChevronLeft size={24} strokeWidth={3} aria-hidden="true" />
    </button>
  );
}
