// app/(platform)/admin/users/page.tsx
// All code and comments must be in English.
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Users, Search, ShieldCheck, UserPlus, Trash2 } from "lucide-react";
import { AddUserModal } from "./_components/add-user-modal";

interface UserProfile {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  full_name: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch users from API route (uses service_role)
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        
        if (data.error) {
          console.error('API Error:', data.error);
          throw new Error(data.error);
        }
        
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users.map((user: any) => ({
            id: user.id,
            email: user.email || 'No email',
            role: user.role || 'student',
            full_name: user.full_name,
            created_at: user.created_at,
          })));
        } else {
          console.warn('Unexpected API response format:', data);
          setUsers([]);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const updateUserRole = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to update role');
      }

      // Refresh users list
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to delete user');
      }

      // Remove user from list
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'teacher':
        return 'bg-[var(--brand-surface)] text-brand border-brand/30';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-soft-text">
              User Management
            </h1>
            <p className="text-sm text-soft-text-muted">
              Manage platform users and assign roles
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              {loading ? "Loading users..." : "View and manage user accounts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Email</th>
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Role</th>
                      <th className="text-left p-4 font-semibold">Joined</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                      <th className="text-left p-4 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{user.email}</td>
                        <td className="p-4">{user.full_name || <span className="text-muted-foreground italic">No name</span>}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md border text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            timeZone: 'UTC'
                          }) : 'N/A'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                              className="text-sm border rounded px-2 py-1 bg-background"
                            >
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id, user.email)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

        {/* Add User Modal */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            // Refresh users list
            const fetchUsers = async () => {
              try {
                const response = await fetch('/api/admin/users');
                if (response.ok) {
                  const { users } = await response.json();
                  if (users) {
                    setUsers(users.map((user: any) => ({
                      id: user.id,
                      email: user.email || 'No email',
                      role: user.role || 'student',
                      full_name: user.full_name,
                      created_at: user.created_at,
                    })));
                  }
                }
              } catch (error) {
                console.error('Failed to refresh users:', error);
              }
            };
            fetchUsers();
          }}
        />
      </div>
    </div>
  );
}


