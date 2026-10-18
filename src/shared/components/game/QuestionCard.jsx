export default function QuestionCard({ question }) {
  if (!question) return null;

  return (
    <div>
      <h2>{question.text}</h2>
    </div>
  );
}