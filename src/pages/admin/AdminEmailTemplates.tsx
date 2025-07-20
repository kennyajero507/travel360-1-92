
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { errorHandler } from "@/services/errorHandlingService";

type Template = {
  id: string;
  template_type: string;
  subject: string;
  content: string;
  variables?: any;
  updated_at?: string;
  created_at?: string;
};

const defaultForm: Omit<Template, "id" | "updated_at" | "created_at"> = {
  template_type: "",
  subject: "",
  content: "",
  variables: {},
};

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
  const { profile } = useAuth();

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("org_id", profile?.org_id)
      .order("updated_at", { ascending: false });
    setLoading(false);

    if (error) {
      errorHandler.handleError(error, "Fetch Email Templates");
    } else {
      setTemplates(data || []);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.org_id]);

  const validate = () => {
    const errors: typeof formErrors = {};
    if (!form.template_type) errors.template_type = "Type is required";
    if (!form.subject) errors.subject = "Subject is required";
    if (!form.content) errors.content = "Content is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const handleEdit = (tpl: Template) => {
    setForm({
      template_type: tpl.template_type,
      subject: tpl.subject,
      content: tpl.content,
      variables: tpl.variables,
    });
    setEditingId(tpl.id);
    setFormErrors({});
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setEditingId(null);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    let result;
    if (editingId) {
      result = await supabase
        .from("email_templates")
        .update({
          ...form,
          org_id: profile?.org_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .select()
        .maybeSingle();
    } else {
      result = await supabase
        .from("email_templates")
        .insert([{ ...form, org_id: profile?.org_id }])
        .select()
        .maybeSingle();
    }
    setLoading(false);

    if (result.error) {
      errorHandler.handleError(result.error, "Upsert Email Template");
    } else if (result.data) {
      toast.success("Template saved!");
      setForm(defaultForm);
      setEditingId(null);
      fetchTemplates();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Email Templates</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Template" : "Create New Template"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type *</label>
              <Input
                name="template_type"
                value={form.template_type}
                onChange={handleInput}
                placeholder="e.g. booking_confirmation"
                disabled={loading}
                className={formErrors.template_type ? "border-red-400" : ""}
              />
              {formErrors.template_type && (
                <span className="text-xs text-red-600">
                  {formErrors.template_type}
                </span>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Subject *</label>
              <Input
                name="subject"
                value={form.subject}
                onChange={handleInput}
                placeholder="Subject"
                disabled={loading}
                className={formErrors.subject ? "border-red-400" : ""}
              />
              {formErrors.subject && (
                <span className="text-xs text-red-600">
                  {formErrors.subject}
                </span>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Content *</label>
              <Textarea
                name="content"
                value={form.content}
                onChange={handleInput}
                placeholder="Email body - you may use variables like {{client_name}}"
                rows={6}
                disabled={loading}
                className={formErrors.content ? "border-red-400" : ""}
              />
              {formErrors.content && (
                <span className="text-xs text-red-600">
                  {formErrors.content}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between my-4">
          <h2 className="text-xl font-semibold">Existing Templates</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCancel()}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            Loading...
          </div>
        ) : (
          <div className="space-y-2">
            {templates.length === 0 && (
              <div className="text-muted-foreground">No templates found.</div>
            )}
            {templates.map((tpl) => (
              <Card
                key={tpl.id}
                className="px-4 py-2 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{tpl.template_type}</div>
                  <div className="text-gray-600 text-sm">{tpl.subject}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(tpl)}
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmailTemplates;
