import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Plus, Trash2, Loader2, LayoutGrid, Table as TableIcon } from "lucide-react";
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
import { ClientKanbanView } from "@/components/clients/ClientKanbanView";

interface Client {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  website_url: string | null;
  created_at: string;
  active: boolean | null;
  pipeline_stage: string;
  open_requests_count?: number;
}

const AdminClients = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "kanban">(() => {
    return (localStorage.getItem("clientsViewMode") as "table" | "kanban") || "table";
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
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
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load clients");
      return;
    }

    // Load open requests count for each client
    const clientsWithCounts = await Promise.all(
      (data || []).map(async (client) => {
        const { count } = await supabase
          .from("update_requests")
          .select("*", { count: "exact", head: true })
          .eq("client_id", client.id)
          .neq("status", "done");

        return { ...client, open_requests_count: count || 0 };
      })
    );

    setClients(clientsWithCounts);
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
        .eq("id", clientToDelete);

      if (error) throw error;

      toast.success("Client deleted");
      loadClients();
      setClientToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClients.size === 0) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .in("id", Array.from(selectedClients));

      if (error) throw error;

      toast.success(`${selectedClients.size} client(s) deleted`);
      setSelectedClients(new Set());
      setClientToDelete(null);
      setDeleteDialogOpen(false);
      loadClients();
    } catch (error) {
      console.error("Error deleting clients:", error);
      toast.error("Failed to delete clients");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedClients.size === clients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(clients.map(c => c.id)));
    }
  };

  const handleViewModeChange = (mode: "table" | "kanban") => {
    setViewMode(mode);
    localStorage.setItem("clientsViewMode", mode);
    setSelectedClients(new Set());
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
      <Helmet>
        <title>Clients | Admin</title>
      </Helmet>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Client overview</h1>
            <p className="text-muted-foreground">
              This is the simple CRM for my website clients. I use this to see who is active and what requests are open.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 border rounded-md p-1 bg-muted/30">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("table")}
              >
                <TableIcon className="w-4 h-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("kanban")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Pipeline
              </Button>
            </div>
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
            {viewMode === "table" && selectedClients.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  setClientToDelete(null);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedClients.size})
              </Button>
            )}
            <Button variant="outline" onClick={() => supabase.auth.signOut()}>
              Log out
            </Button>
          </div>
        </div>

        {viewMode === "table" ? (
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
                            checked={selectedClients.size === clients.length && clients.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Business/Project</th>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">Website</th>
                        <th className="pb-3 font-semibold">Open Requests</th>
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
                              checked={selectedClients.has(client.id)}
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
                          <td className="py-3">
                            {client.open_requests_count! > 0 ? (
                              <span className="font-medium">{client.open_requests_count}</span>
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
                                setClientToDelete(client.id);
                                setDeleteDialogOpen(true);
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
        ) : (
          <ClientKanbanView clients={clients} onUpdate={loadClients} />
        )}

        <CreateClientDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onClientCreated={handleClientCreated}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client{selectedClients.size > 1 ? "s" : ""}?</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedClients.size > 1 || !clientToDelete ? (
                  <>
                    Are you sure you want to delete {selectedClients.size} selected client(s)? This will also delete all their requests. This action cannot be undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete this client? This will also delete all their requests. This action cannot be undone.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={selectedClients.size > 1 || !clientToDelete ? handleBulkDelete : handleDeleteClient}
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
