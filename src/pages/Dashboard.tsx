
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { FileText, Users, Calendar, ArrowUp } from "lucide-react";
import { Progress } from "../components/ui/progress";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to TravelFlow360. Your quote management system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Active Quotes" 
          value="24" 
          trend="+12%" 
          description="vs. last month" 
          icon={<FileText className="text-primary" />} 
        />
        <StatsCard 
          title="Total Clients" 
          value="145" 
          trend="+5%" 
          description="vs. last month" 
          icon={<Users className="text-primary" />} 
        />
        <StatsCard 
          title="New Inquiries" 
          value="8" 
          trend="+3%" 
          description="vs. last month" 
          icon={<Calendar className="text-primary" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quote Conversion Rate</CardTitle>
            <CardDescription>Last 30 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-primary mr-2" />
                  <span>Successfully Converted</span>
                </div>
                <span className="font-medium">68%</span>
              </div>
              <Progress value={68} className="h-2" />
              
              <div className="flex items-center justify-between text-sm mt-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-gray-300 mr-2" />
                  <span>Pending</span>
                </div>
                <span className="font-medium">24%</span>
              </div>
              <Progress value={24} className="h-2 bg-gray-100" />
              
              <div className="flex items-center justify-between text-sm mt-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-300 mr-2" />
                  <span>Rejected</span>
                </div>
                <span className="font-medium">8%</span>
              </div>
              <Progress value={8} className="h-2 bg-gray-100" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest agent activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem 
                action="Created a new quote" 
                client="Sarah Johnson" 
                details="$4,850 - 7 nights in Zanzibar" 
                time="2 hours ago" 
              />
              <ActivityItem 
                action="Updated quote" 
                client="Michael Chen" 
                details="Added transfer service" 
                time="5 hours ago" 
              />
              <ActivityItem 
                action="Quote approved" 
                client="Emily Rodriguez" 
                details="$3,200 - 5 nights in Nairobi" 
                time="Yesterday" 
              />
              <ActivityItem 
                action="New inquiry" 
                client="David Kim" 
                details="Family vacation - Budget: $6,000" 
                time="Yesterday" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  description: string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, trend, description, icon }: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <div className="flex items-center text-sm text-green-600">
            <ArrowUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  action: string;
  client: string;
  details: string;
  time: string;
}

const ActivityItem = ({ action, client, details, time }: ActivityItemProps) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{action}</p>
        <p className="text-sm text-gray-500">{client} - {details}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
