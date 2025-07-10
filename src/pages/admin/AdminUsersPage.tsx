import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  User,
  Mail,
  Calendar,
  Settings,
  Eye,
  Save,
  X
} from 'lucide-react';
import { dbService } from '@/lib/supabase';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'viewer',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await dbService.getPortalUsers();
    setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const userData = {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await dbService.createPortalUser(userData);
      if (!error) {
        fetchUsers();
        setIsAddModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const userData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await dbService.updatePortalUser(editingUser.id, userData);
      if (!error) {
        fetchUsers();
        setEditingUser(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const { error } = await dbService.db.from('admin_users').delete().eq('id', id);
        if (!error) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'viewer',
      status: 'active'
    });
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      name: user.name || '',
      role: user.role || 'viewer',
      status: user.status || 'active'
    });
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      'supermanager': 'bg-red-100 text-red-800',
      'editor': 'bg-blue-100 text-blue-800',
      'viewer': 'bg-green-100 text-green-800',
    };
    
    return variants[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'supermanager':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Portal Users</h1>
            <p className="text-slate-600 text-lg">Loading users...</p>
          </div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-800 mb-2 truncate">Portal Users</h1>
          <p className="text-slate-600 text-sm lg:text-lg">Manage portal user accounts and permissions</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Portal User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Portal User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="supermanager">Super Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                <Save className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-2 border-red-200 hover:shadow-lg transition-all min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">Super Managers</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'supermanager').length}
                </p>
              </div>
              <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-red-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 hover:shadow-lg transition-all min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">Editors</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'editor').length}
                </p>
              </div>
              <Edit className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 hover:shadow-lg transition-all min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">Viewers</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'viewer').length}
                </p>
              </div>
              <Eye className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-200 hover:shadow-lg transition-all min-w-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">Active Users</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <User className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-slate-200 min-w-0">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-48"
            >
              <option value="all">All Roles</option>
              <option value="supermanager">Super Manager</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4 lg:gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-slate-200 min-w-0">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start space-x-4 min-w-0 flex-1">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 lg:h-8 lg:w-8 text-slate-600" />
                    </div>
                    <div className="space-y-3 min-w-0 flex-1">
                      <div>
                        <h3 className="text-lg lg:text-xl font-bold text-slate-900 truncate">{user.name}</h3>
                        <div className="flex items-center space-x-2 mt-1 min-w-0">
                          <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <span className="text-slate-600 truncate">{user.email}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <Badge className={getRoleBadge(user.role)}>
                            {user.role?.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge className={getStatusBadge(user.status)}>
                          {user.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Last Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                        </div>
                        <div className="flex items-center space-x-2 min-w-0">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Created: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditModal(user)} className="w-full sm:w-auto">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">No portal users match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portal User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="supermanager">Super Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              <Save className="h-4 w-4 mr-2" />
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Permissions Info */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-slate-800">
            <Shield className="h-6 w-6 mr-3 text-red-600" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Super Manager</h3>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Full system access</li>
                <li>• User management</li>
                <li>• System configuration</li>
                <li>• All CRUD operations</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Edit className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Editor</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Content management</li>
                <li>• Product editing</li>
                <li>• Translation updates</li>
                <li>• Client responses</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <Eye className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Viewer</h3>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Read-only access</li>
                <li>• View reports</li>
                <li>• Export data</li>
                <li>• Dashboard access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;