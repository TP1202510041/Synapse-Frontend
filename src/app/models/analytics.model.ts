export interface ProgressAnalytics {
  sessions: Array<{
    sessionId: string;
    date: string;
    avgBPM: number;
    maxBPM: number;
    duration: number;
    exposureLevel: string;
    observations: string;
  }>;
  trends: {
    bpmTrend: 'improving' | 'stable' | 'worsening';
    exposureTrend: 'progressing' | 'stable' | 'regressing';
    bpmReduction: number;
    exposureProgression: string[];
  };
}

export interface PatientMetrics {
  aggregatedMetrics: {
    totalSessions: number;
    avgBPM: number;
    avgSessionDuration: number;
    bpmReduction: number;
    exposureProgression: string[];
  };
  evolutionData: Array<{
    sessionNumber: number;
    date: string;
    avgBPM: number;
    maxBPM: number;
    exposureLevel: string;
  }>;
  trendAnalysis: {
    bpmTrend: 'improving' | 'stable' | 'worsening';
    trendPercentage: number;
    milestones: Array<{
      date: string;
      description: string;
      type: 'improvement' | 'setback' | 'milestone';
    }>;
  };
}

export interface SessionComparison {
  session1: {
    sessionId: string;
    date: string;
    avgBPM: number;
    maxBPM: number;
    duration: number;
    exposureLevel: string;
  };
  session2: {
    sessionId: string;
    date: string;
    avgBPM: number;
    maxBPM: number;
    duration: number;
    exposureLevel: string;
  };
  comparison: {
    bpmImprovement: number;
    durationChange: number;
    exposureLevelChange: string;
    overallProgress: 'improved' | 'stable' | 'declined';
  };
}

export interface CompareSessionsRequest {
  sessionIds: string[]; // El backend espera un array de sessionIds
}