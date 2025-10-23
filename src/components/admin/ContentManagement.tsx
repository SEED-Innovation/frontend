
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, FileText, Video, Trophy, MessageSquare } from 'lucide-react';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('challenges');

  // Mock data
  const challenges = [
    {
      id: 1,
      title: '30-Day Consistency Challenge',
      description: 'Play tennis for 30 consecutive days',
      status: 'Active',
      participants: 234,
      startDate: '2024-01-01',
      endDate: '2024-01-30',
      reward: '500 points'
    },
    {
      id: 2,
      title: 'Perfect Serve Week',
      description: 'Achieve 80% serve accuracy for a week',
      status: 'Draft',
      participants: 0,
      startDate: '2024-02-01',
      endDate: '2024-02-07',
      reward: '300 points'
    }
  ];

  const trainingContent = [
    {
      id: 1,
      title: 'Basic Forehand Technique',
      type: 'Video',
      duration: '5:30',
      level: 'Beginner',
      views: 1250,
      status: 'Published'
    },
    {
      id: 2,
      title: 'Advanced Serve Mechanics',
      type: 'Video',
      duration: '8:45',
      level: 'Advanced',
      views: 890,
      status: 'Published'
    }
  ];

  const communityPosts = [
    {
      id: 1,
      author: 'John Smith',
      content: 'Just completed my first SEED session! Amazing insights...',
      type: 'Text',
      likes: 45,
      comments: 12,
      reported: false,
      status: 'Published'
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      content: 'Match highlights video',
      type: 'Video',
      likes: 78,
      comments: 23,
      reported: true,
      status: 'Under Review'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
        <Button className="bg-tennis-purple-600 hover:bg-tennis-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 p-2 bg-gradient-to-r from-admin-surface to-admin-secondary border-2 border-border rounded-xl h-16">
          <TabsTrigger 
            value="challenges" 
            className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <Trophy className="w-4 h-4" />
            <span>Challenges</span>
          </TabsTrigger>
          <TabsTrigger 
            value="training" 
            className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <Video className="w-4 h-4" />
            <span>Training Content</span>
          </TabsTrigger>
          <TabsTrigger 
            value="community" 
            className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Community Posts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="rewards" 
            className="flex items-center space-x-2 h-12 rounded-lg font-medium text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
          >
            <Trophy className="w-4 h-4" />
            <span>Rewards & Badges</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Challenges</CardTitle>
              <Button size="sm" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Challenge
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Trophy className="w-5 h-5 text-tennis-green-600" />
                        <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                        <Badge className={challenge.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {challenge.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{challenge.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{challenge.participants} participants</span>
                        <span>{challenge.startDate} - {challenge.endDate}</span>
                        <span>Reward: {challenge.reward}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Training Videos & Drills</CardTitle>
              <Button size="sm" className="bg-tennis-purple-600 hover:bg-tennis-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Upload Content
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Video className="w-8 h-8 text-tennis-purple-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{content.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{content.duration}</span>
                          <Badge variant="outline">{content.level}</Badge>
                          <span>{content.views} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800">{content.status}</Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Posts Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <MessageSquare className="w-6 h-6 text-gray-600" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">{post.author}</span>
                          {post.reported && (
                            <Badge className="bg-red-100 text-red-800">Reported</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{post.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{post.likes} likes</span>
                          <span>{post.comments} comments</span>
                          <Badge variant="outline">{post.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {post.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600">Remove</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rewards & Badges System</CardTitle>
              <Button size="sm" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Badge
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Rewards and badges management interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
