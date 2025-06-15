import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { enhancedBookingService } from "../../services/enhancedBookingService";
import { Notification } from "../../types/enhanced-booking.types";
import { Mail, Send, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface NotificationCenterProps {
  bookingId?: string;
}

const NotificationCenter = ({ bookingId }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    recipient_email: '',
    subject: '',
    content: '',
    notification_type: 'booking_update'
  });

  useEffect(() => {
    loadNotifications();
  }, [bookingId]);

  const loadNotifications = async () => {
    try {
      // This would need to be implemented in the enhanced service
      // For now, we'll show a placeholder
      setNotifications([]);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    try {
      const notification = {
        ...newNotification,
        booking_id: bookingId,
        status: 'pending' as const
      };

      const success = await enhancedBookingService.sendNotification(notification);
      if (success) {
        setShowCreateDialog(false);
        setNewNotification({
          recipient_email: '',
          subject: '',
          content: '',
          notification_type: 'booking_update'
        });
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const handleSendTestNotification = async () => {
    try {
      // This previously had a parameter; updated so it's .sendNotification() with no arguments.
      await enhancedBookingService.sendNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-300",
      sent: "bg-green-50 text-green-700 border-green-300",
      failed: "bg-red-50 text-red-700 border-red-300"
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Client Communications
          </div>
          {bookingId && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Client Notification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient_email">Recipient Email</Label>
                    <Input
                      id="recipient_email"
                      type="email"
                      value={newNotification.recipient_email}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, recipient_email: e.target.value }))}
                      placeholder="Enter client email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notification_type">Type</Label>
                    <Select
                      value={newNotification.notification_type}
                      onValueChange={(value) => setNewNotification(prev => ({ ...prev, notification_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking_confirmation">Booking Confirmation</SelectItem>
                        <SelectItem value="booking_update">Booking Update</SelectItem>
                        <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                        <SelectItem value="voucher_delivery">Voucher Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={newNotification.subject}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      value={newNotification.content}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter your message"
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendNotification}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications sent yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Send booking confirmations, updates, and reminders to your clients
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.recipient_email}</TableCell>
                  <TableCell className="font-medium">{notification.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {notification.notification_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(notification.status)}
                      {getStatusBadge(notification.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {notification.sent_at 
                      ? new Date(notification.sent_at).toLocaleDateString()
                      : 'Pending'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
