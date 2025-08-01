import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePageConfig, PageConfig } from '@/contexts/PageConfigContext';



export default function PageManagementPage() {
  const { pageConfigs: pages, updatePageConfigs } = usePageConfig();
  const [editingPage, setEditingPage] = useState<PageConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const savePageConfigurations = (updatedPages: PageConfig[]) => {
    updatePageConfigs(updatedPages);
    toast.success('Page configurations saved successfully');
  };

  const handleToggleActive = (pageId: string) => {
    const updatedPages = pages.map(page => 
      page.id === pageId ? { ...page, isActive: !page.isActive } : page
    );
    savePageConfigurations(updatedPages);
  };

  const handleTogglePrices = (pageId: string) => {
    const updatedPages = pages.map(page => 
      page.id === pageId ? { ...page, showPrices: !page.showPrices } : page
    );
    savePageConfigurations(updatedPages);
  };

  const handleToggleComingSoon = (pageId: string) => {
    const updatedPages = pages.map(page => 
      page.id === pageId ? { ...page, comingSoon: !page.comingSoon } : page
    );
    savePageConfigurations(updatedPages);
  };

  const handleEditPage = (page: PageConfig) => {
    setEditingPage({ ...page });
    setIsDialogOpen(true);
  };

  const handleSavePage = () => {
    if (!editingPage) return;

    const updatedPages = pages.map(page => 
      page.id === editingPage.id ? editingPage : page
    );
    savePageConfigurations(updatedPages);
    setIsDialogOpen(false);
    setEditingPage(null);
  };



  const getStatusBadge = (page: PageConfig) => {
    if (!page.isActive) {
      return <Badge variant="destructive">Deactivated</Badge>;
    }
    if (page.comingSoon) {
      return <Badge variant="secondary">Coming Soon</Badge>;
    }
    if (page.redirectUrl) {
      return <Badge variant="outline">Redirected</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>Page Management | Hublinq Management Portal</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Page Management</h1>
            <p className="text-gray-600 mt-2">
              Manage page visibility, redirects, and price display settings
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                    {getStatusBadge(page)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPage(page)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Page Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={page.isActive}
                        onCheckedChange={() => handleToggleActive(page.id)}
                      />
                      <span className="text-sm">
                        {page.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Show Prices</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={page.showPrices}
                        onCheckedChange={() => handleTogglePrices(page.id)}
                        disabled={!page.isActive}
                      />
                      <span className="text-sm">
                        {page.showPrices ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Coming Soon</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={page.comingSoon}
                        onCheckedChange={() => handleToggleComingSoon(page.id)}
                        disabled={!page.isActive}
                      />
                      <span className="text-sm">
                        {page.comingSoon ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Page Path</Label>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {page.path}
                      </code>
                      {page.redirectUrl && (
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>

                {page.redirectUrl && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium text-blue-800">
                      Redirect URL:
                    </Label>
                    <p className="text-sm text-blue-600 mt-1">{page.redirectUrl}</p>
                  </div>
                )}

                <div className="mt-4">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Page Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Page Configuration</DialogTitle>
              <DialogDescription>
                Configure page settings, redirects, and visibility options.
              </DialogDescription>
            </DialogHeader>
            
            {editingPage && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Page Name</Label>
                  <Input
                    id="name"
                    value={editingPage.name}
                    onChange={(e) => setEditingPage({ ...editingPage, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingPage.description}
                    onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirectUrl">Redirect URL (optional)</Label>
                  <Input
                    id="redirectUrl"
                    value={editingPage.redirectUrl || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, redirectUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to disable redirect
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingPage.isActive}
                      onCheckedChange={(checked) => setEditingPage({ ...editingPage, isActive: checked })}
                    />
                    <Label className="text-sm">Active</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingPage.showPrices}
                      onCheckedChange={(checked) => setEditingPage({ ...editingPage, showPrices: checked })}
                    />
                    <Label className="text-sm">Show Prices</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingPage.comingSoon}
                      onCheckedChange={(checked) => setEditingPage({ ...editingPage, comingSoon: checked })}
                    />
                    <Label className="text-sm">Coming Soon</Label>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSavePage}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}