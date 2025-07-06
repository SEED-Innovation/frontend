import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  User, 
  MapPin,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SessionRecord } from '@/types/admin';
import { toast } from 'sonner';

// Mock session data
const mockSessions: SessionRecord[] = [
  {
    id: '1',
    courtId: 'court-1',
    courtName: 'Court A',
    playerId: 'player-1',
    playerName: 'Ahmed Al-Rashid',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T11:30:00Z',
    duration: 90,
    status: 'completed',
    bookingId: 'booking-1',
    notes: 'Regular training session'
  },
  {
    id: '2',
    courtId: 'court-2',
    courtName: 'Court B',
    playerId: 'player-2',
    playerName: 'Sarah Mohammed',
    startTime: '2024-01-15T14:00:00Z',
    endTime: '',
    duration: 45, // current duration
    status: 'active',
    bookingId: 'booking-2'
  },
  {
    id: '3',
    courtId: 'court-3',
    courtName: 'Court C',
    playerId: 'player-3',
    playerName: 'Omar Abdullah',
    startTime: '2024-01-15T16:00:00Z',
    endTime: '',
    duration: 0,
    status: 'cancelled',
    bookingId: 'booking-3',
    notes: 'Player cancelled due to weather'
  }
];

const SessionMonitoring = () => {
  const [sessions] = useState<SessionRecord[]>(mockSessions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = session.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.courtName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
      const matchesCourt = courtFilter === 'all' || session.courtName === courtFilter;
      
      return matchesSearch && matchesStatus && matchesCourt;
    });
  }, [sessions, searchTerm, statusFilter, courtFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-600" />;
      case 'completed': return <Square className="w-4 h-4 text-gray-600" />;
      case 'cancelled': return <Pause className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Ongoing';
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const statsCards = [
    {
      title: 'Active Sessions',
      value: sessions.filter(s => s.status === 'active').length,
      icon: Play,
      color: 'text-green-600'
    },
    {
      title: 'Completed Today',
      value: sessions.filter(s => s.status === 'completed').length,
      icon: Square,
      color: 'text-gray-600'
    },
    {
      title: 'Total Duration',
      value: formatDuration(sessions.reduce((sum, s) => sum + s.duration, 0)),
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Cancelled',
      value: sessions.filter(s => s.status === 'cancelled').length,
      icon: Pause,
      color: 'text-red-600'
    }
  ];

  const uniqueCourts = [...new Set(sessions.map(s => s.courtName))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Monitoring</h1>
          <p className="text-gray-600 mt-1">Track ongoing and completed court sessions</p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
          Live Monitoring
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  </div>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by player or court name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courtFilter} onValueChange={setCourtFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by court" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courts</SelectItem>
                {uniqueCourts.map(court => (
                  <SelectItem key={court} value={court}>{court}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Court</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{session.courtName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{session.playerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatTime(session.startTime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formatDuration(session.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 w-fit ${getStatusBadge(session.status)}`}>
                        {getStatusIcon(session.status)}
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {session.status === 'active' && (
                          <Button size="sm" variant="outline">
                            <Square className="w-4 h-4 mr-1" />
                            End
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionMonitoring;