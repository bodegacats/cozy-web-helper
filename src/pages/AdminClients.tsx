import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Plus, Trash2, Loader2 } from "lucide-react";
import { CreateClientDialog } from "@/components/CreateClientDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  website_url: string | null;
  created_at: string;
}

const AdminClients = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      // Don't reveal this is an admin area
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadClients();
    }
  }, [isAdmin]);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading clients:', error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const handleClientCreated = (clientId: string) => {
    loadClients();
    navigate(`/admin/clients/${clientId}`);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientToDelete.id);

      if (error) throw error;

      toast.success("Client deleted");
      setClients((prev) => prev.filter((client) => client.id !== clientToDelete.id));
      setClientToDelete(null);
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClientIds.length === 0) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .in("id", selectedClientIds);

      if (error) throw error;

      toast.success(`${selectedClientIds.length} client(s) deleted`);
      setClients((prev) => prev.filter((client) => !selectedClientIds.includes(client.id)));
      setSelectedClientIds([]);
      setClientToDelete(null);
    } catch (error) {
      console.error("Error deleting clients:", error);
      toast.error("Failed to delete clients");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClientIds.length === clients.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(clients.map((client) => client.id));
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Client overview</h1>
            <p className="text-muted-foreground">
              This is the simple CRM for my website clients. I use this to see who is active and what requests are open.
            </p>
          </div>
          <div className="flex gap-2">
            {selectedClientIds.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setClientToDelete({ id: "bulk" } as Client)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedClientIds.length} selected
              </Button>
            )}
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Client
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/leads')}>
              Leads
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/requests')}>
              Requests
            </Button>
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Log out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All clients</CardTitle>
            <CardDescription>
              {clients.length} {clients.length === 1 ? 'client' : 'clients'} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No clients yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 w-[50px]">
                        <Checkbox
                          checked={selectedClientIds.length === clients.length && clients.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Business/Project</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Website</th>
                      <th className="pb-3 font-semibold">Created</th>
                      <th className="pb-3"></th>
                      <th className="pb-3 w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b last:border-0">
                        <td className="py-3">
                          <Checkbox
                            checked={selectedClientIds.includes(client.id)}
                            onCheckedChange={() => toggleClientSelection(client.id)}
                          />
                        </td>
                        <td className="py-3">{client.name}</td>
                        <td className="py-3 text-muted-foreground">
                          {client.business_name || '—'}
                        </td>
                        <td className="py-3">
                          <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                            {client.email}
                          </a>
                        </td>
                        <td className="py-3">
                          {client.website_url ? (
                            <a
                              href={client.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Link <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(client.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/clients/${client.id}`)}
                          >
                            View
                          </Button>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setClientToDelete(client);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <CreateClientDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onClientCreated={handleClientCreated}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client{selectedClientIds.length > 1 ? "s" : ""}?</AlertDialogTitle>
              <AlertDialogDescription>
                {clientToDelete?.id === "bulk" ? (
                  <>
                    Are you sure you want to delete {selectedClientIds.length} selected client(s)? This will also delete all their requests. This action cannot be undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">{clientToDelete?.name}</span>? This will also delete all their requests. This action cannot be undone.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={clientToDelete?.id === "bulk" ? handleBulkDelete : handleDeleteClient}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminClients;
