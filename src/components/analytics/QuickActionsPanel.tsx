
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';

const QuickActionsPanel = () => {
  const quickActions = [
    {
      title: 'New Inquiry',
      description: 'Start a new client inquiry',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/inquiries/create',
      color: 'bg-blue-500 hover:bg-blue-600',
      urgency: 'high'
    },
    {
      title: 'Create Quote',
      description: 'Generate a quote for a client',
      icon: <FileText className="h-5 w-5" />,
      href: '/quotes/create',
      color: 'bg-green-500 hover:bg-green-600',
      urgency: 'medium'
    },
    {
      title: 'New Booking',
      description: 'Create a new booking',
      icon: <Calendar className="h-5 w-5" />,
      href: '/bookings/create',
      color: 'bg-purple-500 hover:bg-purple-600',
      urgency: 'medium'
    },
    {
      title: 'Add Client',
      description: 'Register a new client',
      icon: <Users className="h-5 w-5" />,
      href: '/clients',
      color: 'bg-orange-500 hover:bg-orange-600',
      urgency: 'low'
    }
  ];

  const recentActivities = [
    {
      type: 'inquiry',
      title: 'New inquiry from Sarah Johnson',
      description: 'Zanzibar Beach Holiday - 7 nights',
      time: '2 hours ago',
      urgent: true
    },
    {
      type: 'quote',
      title: 'Quote approved by Michael Chen',
      description: 'Serengeti Safari - $4,850',
      time: '5 hours ago',
      urgent: false
    },
    {
      type: 'booking',
      title: 'Booking confirmed for Emily Rodriguez',
      description: 'Nairobi City Tour - $1,200',
      time: 'Yesterday',
      urgent: false
    },
    {
      type: 'payment',
      title: 'Payment received from David Kim',
      description: 'Mombasa Beach Resort - $2,800',
      time: '2 days ago',
      urgent: false
    }
  ];

  const upcomingTasks = [
    {
      title: 'Follow up with 3 pending quotes',
      dueTime: 'Due in 2 hours',
      priority: 'high'
    },
    {
      title: 'Prepare vouchers for weekend departures',
      dueTime: 'Due today',
      priority: 'medium'
    },
    {
      title: 'Monthly report preparation',
      dueTime: 'Due tomorrow',
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Fast access to common tasks and workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild
                className={`${action.color} text-white h-20 flex-col gap-2 relative overflow-hidden group`}
              >
                <Link to={action.href}>
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <span className="text-xs opacity-90">{action.description}</span>
                  {action.urgency === 'high' && (
                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                      Priority
                    </Badge>
                  )}
                  <ArrowRight className="h-4 w-4 absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === 'inquiry' ? 'bg-blue-100' :
                    activity.type === 'quote' ? 'bg-green-100' :
                    activity.type === 'booking' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    {activity.type === 'inquiry' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'quote' && <FileText className="h-4 w-4 text-green-600" />}
                    {activity.type === 'booking' && <Calendar className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'payment' && <TrendingUp className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      {activity.urgent && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>
              Tasks and deadlines requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.dueTime}</p>
                  </div>
                  <Badge 
                    variant={
                      task.priority === 'high' ? 'destructive' :
                      task.priority === 'medium' ? 'default' : 
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/tasks">
                  View All Tasks
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
