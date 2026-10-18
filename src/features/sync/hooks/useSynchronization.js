import { useGame } from "../../../app/contexts/GameContext";
import { useSocket } from "../../../app/contexts/SocketContext";
import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for handling answer submission with metrics collection
 * Supports both server-authoritative and optimistic models
 */
export function useAnswerSubmission() {
  const { socket } = useSocket();
  const { 
    roomId, 
    currentQuestion, 
    syncModel, 
    setMetrics,
    setClientPredictedScore,
    setServerScore
  } = useGame();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const clientTimestampRef = useRef(null);

  /**
   * Calculate client-side predicted score (for optimistic model)
   */
  const calculateClientScore = useCallback((isCorrect, timeRemaining) => {
    if (!isCorrect) return 0;
    
    const basePoints = 100;
    const speedBonus = Math.round((timeRemaining / 30) * 50); // Assuming 30 second questions
    return basePoints + speedBonus;
  }, []);

  /**
   * Handle submission response and metrics
   */
  const handleSubmissionResponse = useCallback((response, clientTimestamp) => {
    if (!response || !response.timestamp) return;

    // Calculate metrics
    const perceivedLatency = response.timestamp - clientTimestamp;
    
    setMetrics(prev => ({
      ...prev,
      perceivedLatency,
      scoreMismatch: response.scoreMismatch || false
    }));

    if (response.pointsAwarded !== undefined) {
      setServerScore(response.pointsAwarded);
    }
  }, [setMetrics, setServerScore]);

  /**
   * Submit answer with appropriate sync strategy
   */
  const submitAnswer = useCallback(async (answer) => {
    if (!socket || !roomId || !currentQuestion) {
      setSubmitError("Cannot submit: missing game context");
      return false;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Record client timestamp
      clientTimestampRef.current = Date.now();

      if (syncModel === "optimistic") {
        // Client-side: Calculate and apply optimistic update immediately
        const clientScore = calculateClientScore(true, 30); // This should be actual time remaining
        setClientPredictedScore(clientScore);

        // Emit with client prediction
        socket.emit("submit_answer", {
          roomId,
          questionId: currentQuestion.id,
          answer,
          clientTimestamp: clientTimestampRef.current,
          clientPredictedScore: clientScore,
          syncModel: "optimistic"
        }, (response) => {
          handleSubmissionResponse(response, clientTimestampRef.current);
        });
      } else {
        // Server-authoritative: Wait for server response
        socket.emit("submit_answer", {
          roomId,
          questionId: currentQuestion.id,
          answer,
          clientTimestamp: clientTimestampRef.current,
          syncModel: "server-authoritative"
        }, (response) => {
          handleSubmissionResponse(response, clientTimestampRef.current);
        });
      }

      return true;
    } catch (error) {
      console.error("Error submitting answer:", error);
      setSubmitError(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [socket, roomId, currentQuestion, syncModel, calculateClientScore, setClientPredictedScore, handleSubmissionResponse]);

  return {
    submitAnswer,
    isSubmitting,
    submitError
  };
}

/**
 * Custom hook for timer synchronization
 * Ensures all clients see same countdown
 */
export function useTimerSync() {
  const { socket } = useSocket();
  const { roomId, setTimeRemaining } = useGame();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);
  const localStartTimeRef = useRef(null);

  /**
   * Request timer sync from server
   */
  const requestTimerSync = useCallback(() => {
    if (socket && roomId) {
      socket.emit("timer_sync_request", { roomId });
    }
  }, [socket, roomId]);

  /**
   * Start local timer with server sync
   */
  const startTimer = useCallback((initialSeconds) => {
    setIsTimerRunning(true);
    localStartTimeRef.current = Date.now();
    let secondsRemaining = initialSeconds;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - localStartTimeRef.current) / 1000;
      secondsRemaining = Math.max(0, Math.ceil(initialSeconds - elapsed));
      
      setTimeRemaining(secondsRemaining);

      if (secondsRemaining <= 0) {
        clearInterval(timerIntervalRef.current);
        setIsTimerRunning(false);
      }
    }, 100);
  }, [setTimeRemaining]);

  /**
   * Stop timer
   */
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsTimerRunning(false);
    setTimeRemaining(0);
  }, [setTimeRemaining]);

  /**
   * Resync timer (for late arrivals or clock skew)
   */
  const resyncTimer = useCallback((secondsRemaining) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    localStartTimeRef.current = Date.now();
    let remaining = secondsRemaining;
    setTimeRemaining(remaining);
    setIsTimerRunning(true);

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - localStartTimeRef.current) / 1000;
      remaining = Math.max(0, Math.ceil(secondsRemaining - elapsed));
      
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        setIsTimerRunning(false);
      }
    }, 100);
  }, [setTimeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return {
    isTimerRunning,
    startTimer,
    stopTimer,
    resyncTimer,
    requestTimerSync
  };
}

/**
 * Custom hook for metrics collection and reporting
 */
export function useMetricsCollection() {
  const { socket } = useSocket();
  const { roomId, metrics, syncModel } = useGame();
  const [metricsReport, setMetricsReport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Fetch metrics report from server
   */
  const getMetricsReport = useCallback(async () => {
    if (socket && roomId) {
      socket.emit("get_metrics", { roomId }, (report) => {
        setMetricsReport(report);
      });
    }
  }, [socket, roomId]);

  /**
   * Export metrics as JSON
   */
  const exportMetrics = useCallback(() => {
    if (!metricsReport) {
      console.error("No metrics to export");
      return;
    }

    setIsExporting(true);
    try {
      const dataStr = JSON.stringify(metricsReport, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `metrics-${roomId}-${syncModel}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [metricsReport, roomId, syncModel]);

  /**
   * Get consistency rate
   */
  const getConsistencyRate = useCallback(() => {
    if (!metricsReport) return 0;
    return metricsReport.consistencyRate || 0;
  }, [metricsReport]);

  /**
   * Get average latency
   */
  const getAverageLatency = useCallback(() => {
    if (!metricsReport || !metricsReport.metrics) return 0;
    return metricsReport.metrics.avg_perceived_latency || 0;
  }, [metricsReport]);

  return {
    metricsReport,
    getMetricsReport,
    exportMetrics,
    isExporting,
    getConsistencyRate,
    getAverageLatency,
    currentMetrics: metrics
  };
}

/**
 * Custom hook for leaderboard updates
 */
export function useLeaderboardSync() {
  const { socket } = useSocket();
  const { setLeaderboard } = useGame();

  useEffect(() => {
    if (!socket) return;

    socket.on("leaderboard_update", (data) => {
      setLeaderboard(data.leaderboard || []);
    });

    socket.on("optimistic_leaderboard_update", (data) => {
      // For optimistic model: update UI immediately
      setLeaderboard(prev => {
        const updated = [...prev];
        const playerIdx = updated.findIndex(p => p.id === data.playerId);
        if (playerIdx >= 0) {
          updated[playerIdx].final_score += data.predictedScore;
        }
        return updated;
      });
    });

    return () => {
      socket.off("leaderboard_update");
      socket.off("optimistic_leaderboard_update");
    };
  }, [socket, setLeaderboard]);

  return { setLeaderboard };
}

/**
 * Custom hook for synchronization model selection
 */
export function useSyncModelConfig() {
  const { syncModel, setSyncModel } = useGame();
  const [availableModels] = useState([
    { id: "server-authoritative", label: "Server-Authoritative", description: "High consistency, potential latency" },
    { id: "optimistic", label: "Optimistic Updates", description: "Lower latency, temporary inconsistency possible" }
  ]);

  const changeSyncModel = useCallback((modelId) => {
    if (availableModels.some(m => m.id === modelId)) {
      setSyncModel(modelId);
    }
  }, [availableModels, setSyncModel]);

  return {
    currentModel: syncModel,
    availableModels,
    changeSyncModel
  };
}
