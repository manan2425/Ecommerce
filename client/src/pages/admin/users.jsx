import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchAllUsers, 
    updateUser, 
    toggleUserStatus, 
    deleteUser,
    fetchUserStats 
} from "@/store/admin/user-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
    Users, 
    UserCheck, 
    UserX, 
    Shield, 
    User,
    Search,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    UserPlus
} from "lucide-react";

function AdminUsers() {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { userList, userStats, isLoading } = useSelector(state => state.adminUsers);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        userName: "",
        email: "",
        phone: "",
        role: "user",
        isActive: true
    });

    useEffect(() => {
        dispatch(fetchAllUsers({ role: roleFilter, isActive: statusFilter, search: searchQuery }));
        dispatch(fetchUserStats());
    }, [dispatch, roleFilter, statusFilter]);

    const handleSearch = () => {
        dispatch(fetchAllUsers({ role: roleFilter, isActive: statusFilter, search: searchQuery }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditFormData({
            userName: user.userName,
            email: user.email,
            phone: user.phone || "",
            role: user.role,
            isActive: user.isActive
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const result = await dispatch(updateUser({ 
                id: selectedUser._id, 
                userData: editFormData 
            })).unwrap();
            
            if (result.success) {
                toast({
                    title: "Success",
                    description: "User updated successfully"
                });
                setEditDialogOpen(false);
                dispatch(fetchAllUsers({ role: roleFilter, isActive: statusFilter, search: searchQuery }));
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update user",
                variant: "destructive"
            });
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const result = await dispatch(toggleUserStatus(user._id)).unwrap();
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message
                });
                dispatch(fetchUserStats());
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to toggle user status",
                variant: "destructive"
            });
        }
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const result = await dispatch(deleteUser(selectedUser._id)).unwrap();
            if (result.success) {
                toast({
                    title: "Success",
                    description: "User deleted successfully"
                });
                setDeleteDialogOpen(false);
                dispatch(fetchUserStats());
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete user",
                variant: "destructive"
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Management</h1>
            </div>

            {/* Stats Cards */}
            {userStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                                    <p className="text-xs text-muted-foreground">Total Users</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">{userStats.activeUsers}</p>
                                    <p className="text-xs text-muted-foreground">Active</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <UserX className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-2xl font-bold">{userStats.inactiveUsers}</p>
                                    <p className="text-xs text-muted-foreground">Inactive</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-2xl font-bold">{userStats.adminUsers}</p>
                                    <p className="text-xs text-muted-foreground">Admins</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-2xl font-bold">{userStats.regularUsers}</p>
                                    <p className="text-xs text-muted-foreground">Regular</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-cyan-500" />
                                <div>
                                    <p className="text-2xl font-bold">{userStats.newUsers}</p>
                                    <p className="text-xs text-muted-foreground">New (30d)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1"
                            />
                            <Button onClick={handleSearch} variant="secondary">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({userList.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : userList.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No users found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userList.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        {user.role === 'admin' ? (
                                                            <Shield className="h-4 w-4 text-purple-500" />
                                                        ) : (
                                                            <User className="h-4 w-4 text-blue-500" />
                                                        )}
                                                    </div>
                                                    {user.userName}
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phone || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.isActive ? 'success' : 'destructive'}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(user.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(user.lastLogin)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditClick(user)}
                                                        title="Edit User"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleStatus(user)}
                                                        title={user.isActive ? "Deactivate User" : "Activate User"}
                                                    >
                                                        {user.isActive ? (
                                                            <ToggleRight className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </Button>
                                                    {user.role !== 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteClick(user)}
                                                            title="Delete User"
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                                value={editFormData.userName}
                                onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select 
                                value={editFormData.role} 
                                onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={editFormData.isActive}
                                onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditSubmit} disabled={isLoading}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete <strong>{selectedUser?.userName}</strong>?</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            This action cannot be undone. All data associated with this user will be permanently deleted.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AdminUsers;
