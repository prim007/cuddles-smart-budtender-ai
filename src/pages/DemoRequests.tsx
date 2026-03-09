import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Calendar, Building2, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string | null;
  store_count: string;
  current_systems: string;
  preferred_date: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const DemoRequests = () => {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'created_at' | 'status'>('created_at');
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin privileges are required to view this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate, toast]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .order(sortBy, { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      toast({
        title: "Error Loading Requests",
        description: "Could not load demo requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('demo_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Request status changed to ${newStatus}`,
      });

      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Could not update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-hippie-yellow/20 text-hippie-yellow border-hippie-yellow/50';
      case 'contacted':
        return 'bg-hippie-blue/20 text-hippie-blue border-hippie-blue/50';
      case 'scheduled':
        return 'bg-hippie-green/20 text-hippie-green border-hippie-green/50';
      case 'completed':
        return 'bg-hippie-purple/20 text-hippie-purple border-hippie-purple/50';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-hippie-pink/20">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="text-foreground hover:text-hippie-pink">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange bg-clip-text text-transparent">
              Demo Requests
            </h1>
            <Button onClick={fetchRequests} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              variant={sortBy === 'created_at' ? 'default' : 'outline'}
              onClick={() => setSortBy('created_at')}
            >
              Sort by Date
            </Button>
            <Button
              variant={sortBy === 'status' ? 'default' : 'outline'}
              onClick={() => setSortBy('status')}
            >
              Sort by Status
            </Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Current POS</TableHead>
                    <TableHead>Preferred Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Loading requests...
                      </TableCell>
                    </TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No demo requests yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(request.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {request.company}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {request.email}
                            </div>
                            {request.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {request.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{request.store_count}</TableCell>
                        <TableCell className="capitalize">{request.current_systems}</TableCell>
                        <TableCell>
                          {request.preferred_date ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(request.preferred_date), 'MMM dd, yyyy')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {request.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(request.id, 'contacted')}
                              >
                                Mark Contacted
                              </Button>
                            )}
                            {request.status === 'contacted' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(request.id, 'scheduled')}
                              >
                                Mark Scheduled
                              </Button>
                            )}
                            {request.status === 'scheduled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(request.id, 'completed')}
                              >
                                Mark Completed
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default DemoRequests;
