/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [syncModel, setSyncModel] = useState("server-authoritative"); // or "optimistic"
  const [userRole, setUserRole] = useState("player"); // host or player
  const [metrics, setMetrics] = useState({
    perceivedLatency: null,
    serverLatency: null,
    scoreMismatch: false
  });
  
  // For optimistic model tracking
  const [clientPredictedScore, setClientPredictedScore] = useState(0);
  const [serverScore, setServerScore] = useState(0);
  const [scoreReconciliation, setScoreReconciliation] = useState(null);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateGameState = useCallback((updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(null);
    setRoomId(null);
    setRoomCode(null);
    setPlayers([]);
    setCurrentQuestion(null);
    setIsGameActive(false);
    setLeaderboard([]);
    setMetrics({ perceivedLatency: null, serverLatency: null, scoreMismatch: false });
    setClientPredictedScore(0);
    setServerScore(0);
    setScoreReconciliation(null);
    setTimeRemaining(0);
    setQuestionsAnswered(0);
    setTotalQuestions(0);
    setError(null);
  }, []);

  const value = {
    // Game state
    gameState,
    setGameState,
    updateGameState,
    roomId,
    setRoomId,
    roomCode,
    setRoomCode,
    players,
    setPlayers,
    currentQuestion,
    setCurrentQuestion,
    isGameActive,
    setIsGameActive,
    leaderboard,
    setLeaderboard,
    
    // Synchronization
    syncModel,
    setSyncModel,
    
    // User info
    userRole,
    setUserRole,
    
    // Metrics for research
    metrics,
    setMetrics,
    
    // Optimistic model state
    clientPredictedScore,
    setClientPredictedScore,
    serverScore,
    setServerScore,
    scoreReconciliation,
    setScoreReconciliation,
    
    // Timer
    timeRemaining,
    setTimeRemaining,
    questionsAnswered,
    setQuestionsAnswered,
    totalQuestions,
    setTotalQuestions,
    
    // UI
    loading,
    setLoading,
    error,
    setError,
    
    // Methods
    resetGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
