
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useRole } from "../../contexts/RoleContext";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import { useState } from "react";
import { DollarSign, BadgeDollarSign, Users } from "lucide-react";
import { SubscriptionTier } from "../../contexts/role/types";

const SubscriptionSettings = () => {
  const { tier, setTier, role } = useRole();
  const [isAnnualBilling, setIsAnnualBilling] = useState(true);

  const handleTierChange = (selectedTier: string) => {
    setTier(selectedTier as SubscriptionTier);
    toast.success(`Subscription plan changed to ${selectedTier === 'starter' ? 'Essentials' : selectedTier === 'pro' ? 'Professional' : 'Enterprise'}`);
  };

  // Format role name for display
  const getRoleDisplayName = () => {
    switch(role) {
      case 'system_admin': return 'System Administrator';
      case 'org_owner': return 'Organization Owner';
      case 'tour_operator': return 'Tour Operator';
      case 'agent': return 'Travel Agent';
      case 'client': return 'Client';
      default: return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-600">Subscription Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="font-medium">Current Plan:</h3>
              <Badge variant="outline" className="ml-2">
                {tier === 'starter' ? 'Essentials' : tier === 'pro' ? 'Professional' : 'Enterprise'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className={isAnnualBilling ? "text-gray-500" : "font-medium"}>Monthly</span>
              <Switch 
                checked={isAnnualBilling} 
                onCheckedChange={setIsAnnualBilling}
              />
              <span className={!isAnnualBilling ? "text-gray-500" : "font-medium"}>Annual (Save 15%)</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className={`border ${tier === 'starter' ? 'border-primary' : 'border-border'} h-full`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <BadgeDollarSign className="mr-2 h-5 w-5" />
                    Essentials
                  </div>
                  {tier === 'starter' && <Badge>Current</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold">
                    ${isAnnualBilling ? "55" : "65"}
                    <span className="text-sm font-normal">/month</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {isAnnualBilling ? "Billed annually" : "Billed monthly"}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> 1,000 quotes/month
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> 1 operator + 5 agent seats
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Basic templates & branding
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Up to 500 hotels in inventory
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Email support (48-hr response)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Hotel inventory management
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✕</span> <span className="text-gray-400">Agent management</span>
                    </li>
                  </ul>
                  <div className="text-xs text-gray-500 italic mt-2">
                    Best for: Small teams or solo operators needing reliable quote automation.
                  </div>
                  <Button 
                    className="w-full" 
                    variant={tier === 'starter' ? 'outline' : 'default'}
                    onClick={() => handleTierChange('starter')}
                  >
                    {tier === 'starter' ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`border ${tier === 'pro' ? 'border-primary' : 'border-border'} h-full relative`}>
              {tier !== 'pro' && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-orange-500 hover:bg-orange-600">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Professional
                  </div>
                  {tier === 'pro' && <Badge>Current</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold">
                    ${isAnnualBilling ? "129" : "189"}
                    <span className="text-sm font-normal">/month</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {isAnnualBilling ? "Billed annually" : "Billed monthly"}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> 10,000 quotes/month
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> 3 operators + 25 agent seats
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Premium templates & white-label branding
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Unlimited hotel inventory
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Priority chat/email support (4-hr response)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Advanced analytics dashboard
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600 font-bold">✓</span> <span className="font-medium">Agent management</span>
                    </li>
                  </ul>
                  <div className="text-xs text-gray-500 italic mt-2">
                    Best for: Growing agencies with multiple teams and branding needs.
                  </div>
                  <Button 
                    className="w-full" 
                    variant={tier === 'pro' ? 'outline' : 'default'}
                    onClick={() => handleTierChange('pro')}
                  >
                    {tier === 'pro' ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`border ${tier === 'enterprise' ? 'border-primary' : 'border-border'} h-full`}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Enterprise
                  </div>
                  {tier === 'enterprise' && <Badge>Current</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold">
                    Custom
                    <span className="text-sm font-normal ml-1">pricing</span>
                  </div>
                  <p className="text-xs text-gray-500">Tailored to your volume</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Unlimited quotes and users
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Dedicated account manager
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> API access & custom integrations
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> SLA-backed 24/7 support
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Onboarding & training included
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span> Advanced agent management with permissions
                    </li>
                  </ul>
                  <div className="text-xs text-gray-500 italic mt-2">
                    Best for: Large operators or franchises needing enterprise-grade solutions.
                  </div>
                  <Button 
                    className="w-full" 
                    variant={tier === 'enterprise' ? 'outline' : 'default'}
                    onClick={() => handleTierChange('enterprise')}
                  >
                    {tier === 'enterprise' ? 'Current Plan' : 'Contact Sales'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettings;
