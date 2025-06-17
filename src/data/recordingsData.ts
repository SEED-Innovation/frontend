
import { Recording } from '@/types/recordings';

export const recordings: Recording[] = [
  {
    id: 1,
    title: "Practice Session vs Alex",
    date: "Dec 15, 2024",
    duration: "1:45:32",
    court: "Riverside Tennis Club",
    score: "6-4, 6-2",
    thumbnail: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=225&fit=crop",
    videoUrl: "/videos/match1.mp4",
    stats: {
      serves: 89,
      serveAccuracy: 78,
      avgSpeed: 45,
      winners: 23
    },
    premium: false
  },
  {
    id: 2,
    title: "Match vs Sarah Chen",
    date: "Dec 12, 2024",
    duration: "2:15:18",
    court: "Elite Tennis Academy",
    score: "4-6, 6-3, 6-4",
    thumbnail: "https://images.unsplash.com/photo-1544717684-7ba7d47c6c37?w=400&h=225&fit=crop",
    videoUrl: "/videos/match2.mp4",
    stats: {
      serves: 124,
      serveAccuracy: 82,
      avgSpeed: 48,
      winners: 31
    },
    premium: true
  },
  {
    id: 3,
    title: "Training Session",
    date: "Dec 10, 2024",
    duration: "1:30:45",
    court: "Downtown Sports Center",
    score: "Practice",
    thumbnail: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=225&fit=crop",
    videoUrl: "/videos/match3.mp4",
    stats: {
      serves: 67,
      serveAccuracy: 85,
      avgSpeed: 43,
      winners: 18
    },
    premium: false
  }
];
