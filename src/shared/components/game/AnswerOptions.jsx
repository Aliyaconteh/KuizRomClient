export default function AnswerOptions({ options, onSelect }) {
  return (
    <div>
      {options.map((opt, i) => (
        <button key={i} onClick={() => onSelect(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}