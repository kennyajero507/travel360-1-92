
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface OrganizationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationSetupModal: React.FC<OrganizationSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const { createOrganization, refreshProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }

    setLoading(true);
    
    try {
      const success = await createOrganization(organizationName.trim());
      
      if (success) {
        toast.success('Organization created successfully!');
        await refreshProfile(); // Refresh the user profile
        onClose();
      } else {
        toast.error('Failed to create organization. Please try again.');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('An error occurred while creating the organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Setup</DialogTitle>
          <DialogDescription>
            To get started, please create your organization. This will be your workspace for managing travel bookings and quotes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              type="text"
              placeholder="Enter your company or organization name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={loading || !organizationName.trim()}
            >
              {loading ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
