import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  project_description: string;
  website_url: string | null;
  wish: string;
  created_at: string;
}

const AdminSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contact Submissions</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/admin/clients'} variant="outline">
                View clients
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Log Out
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No submissions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Wish</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell>
                          <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                            {submission.email}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {truncateText(submission.project_description, 80)}
                        </TableCell>
                        <TableCell>
                          {submission.website_url ? (
                            <a
                              href={submission.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Link
                            </a>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div>
                            {expandedId === submission.id ? (
                              <div>
                                <p className="whitespace-pre-wrap">{submission.wish}</p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => setExpandedId(null)}
                                  className="p-0 h-auto"
                                >
                                  Show less
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <p>{truncateText(submission.wish, 100)}</p>
                                {submission.wish.length > 100 && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setExpandedId(submission.id)}
                                    className="p-0 h-auto"
                                  >
                                    Show more
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(submission.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSubmissions;
