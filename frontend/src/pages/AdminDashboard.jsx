import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Shield, User, UserCheck, UserX, Loader2, Search } from 'lucide-react';
import Avatar from '../components/Avatar';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${id}/status`);
      if (res.data.success) {
        setUsers(users.map(u => u._id === id ? { ...u, status: res.data.data.status } : u));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" /> Admin <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-2">Manage users and oversee platform activity.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(u => (
          <Card key={u._id} className={`overflow-hidden border-border transition-all ${u.status === 'inactive' ? 'opacity-70 grayscale' : ''}`}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4 bg-muted/20">
              <Avatar name={u.name} />
              <div className="flex-1 overflow-hidden">
                <CardTitle className="text-lg font-bold truncate">{u.name}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">{u.email}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'}`}>
                {u.role}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium capitalize">{u.status}</span>
                </div>
                {u._id !== currentUser.id && (
                  <Button 
                    variant={u.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                    className="h-8 px-3 text-xs font-bold"
                    onClick={() => toggleUserStatus(u._id)}
                  >
                    {u.status === 'active' ? (
                      <><UserX className="h-3 w-3 mr-1" /> Block</>
                    ) : (
                      <><UserCheck className="h-3 w-3 mr-1" /> Unblock</>
                    )}
                  </Button>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-[11px] text-muted-foreground uppercase font-bold tracking-widest">
                <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground font-medium">No users found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
