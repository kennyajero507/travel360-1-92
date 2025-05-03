
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useRole } from "../../contexts/RoleContext";
import { toast } from "sonner";

const SubscriptionSettings = () => {
  const { tier, setTier, role } = useRole();

  const handleTierChange = (selectedTier: string) => {
    setTier(selectedTier as 'basic' | 'pro' | 'enterprise');
    toast.success(`Subscription tier changed to ${selectedTier}`);
  };

  // Format role name for display
  const getRoleDisplayName = () => {
    switch(role) {
      case 'system_admin': return 'System Administrator';
      case 'org_owner': return 'Organization Owner';
      case 'team_manager': return 'Team Manager';
      case 'agent': return 'Travel Agent';
      case 'client': return 'Client';
      default: return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <h3 className="font-medium">Current Plan:</h3>
            <Badge variant="outline" className="ml-2">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className={`border ${tier === 'basic' ? 'border-primary' : 'border-border'} h-full`}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  Basic
                  {tier === 'basic' && <Badge>Current</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 500 quotes/month</li>
                    <li>✓ Basic templates</li>
                    <li>✓ Single user</li>
                    {(['agent', 'team_manager', 'org_owner'].includes(role)) && (
                      <>
                        <li>✓ Submit hotels for approval</li>
                        {role === 'team_manager' && <li>✗ Agent management</li>}
                        {role === 'org_owner' && <li>✓ Limited team management</li>}
                      </>
                    )}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier === 'basic' ? 'outline' : 'default'}
                    onClick={() => handleTierChange('basic')}
                  >
                    {tier === 'basic' ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`border ${tier === 'pro' ? 'border-primary' : 'border-border'} h-full`}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  Pro
                  {tier === 'pro' && <Badge>Current</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold">$79<span className="text-sm font-normal">/month</span></div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 10,000 quotes/month</li>
                    <li>✓ Premium branding</li>
                    <li>✓ Up to 5 users</li>
                    {(['agent', 'team_manager', 'org_owner'].includes(role)) && (
                      <>
                        <li>✓ Add/edit hotels</li>
                        {role === 'team_manager' && <li>✓ Agent management</li>}
                        {role === 'org_owner' && <li>✓ Full team management</li>}
                        {role === 'agent' && <li>✓ Direct hotel submission</li>}
                      </>
                    )}
                    <li>✓ API access</li>
                  </ul>
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
                <CardTitle className="flex justify-between">
                  Enterprise
                  {tier === 'enterprise' && <Badge>Current</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold">Custom</div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Unlimited quotes</li>
                    <li>✓ Premium branding</li>
                    <li>✓ Unlimited users</li>
                    {(['agent', 'team_manager', 'org_owner'].includes(role)) && (
                      <>
                        <li>✓ Complete hotel management</li>
                        {(role === 'team_manager' || role === 'org_owner') && <li>✓ Advanced agent management</li>}
                        {role === 'org_owner' && <li>✓ Multi-department controls</li>}
                        {role === 'agent' && <li>✓ Enhanced hotel capabilities</li>}
                      </>
                    )}
                    <li>✓ API access</li>
                    <li>✓ Dedicated support</li>
                    <li>✓ Custom integrations</li>
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier === 'enterprise' ? 'outline' : 'default'}
                    onClick={() => handleTierChange('enterprise')}
                  >
                    {tier === 'enterprise' ? 'Current Plan' : 'Select Plan'}
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
