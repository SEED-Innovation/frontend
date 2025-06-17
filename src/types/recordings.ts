
export interface Recording {
  id: number;
  title: string;
  date: string;
  duration: string;
  court: string;
  score: string;
  thumbnail: string;
  videoUrl: string;
  stats: {
    serves: number;
    serveAccuracy: number;
    avgSpeed: number;
    winners: number;
  };
  premium: boolean;
}
