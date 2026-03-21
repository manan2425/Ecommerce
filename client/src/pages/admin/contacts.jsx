import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchAllContacts, 
    fetchContactById,
    updateContactStatus, 
    deleteContact,
    bulkDeleteContacts,
    addNewContact,
    updateContactInList,
    removeContactFromList
} from "@/store/admin/contact-slice";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
    Search,
    Mail,
    MailOpen,
    MessageSquare,
    CheckCircle,
    XCircle,
    Trash2,
    MoreHorizontal,
    Eye,
    Reply,
    Clock,
    Building2,
    Phone,
    User,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const statusConfig = {
    new: { label: "New", color: "bg-blue-500", icon: Mail },
    read: { label: "Read", color: "bg-yellow-500", icon: MailOpen },
    replied: { label: "Replied", color: "bg-green-500", icon: Reply },
    closed: { label: "Closed", color: "bg-gray-500", icon: CheckCircle }
};

const AdminContacts = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { contacts, pagination, stats, isLoading, currentContact } = useSelector(
        (state) => state.adminContacts
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");

    // Fetch contacts
    const loadContacts = () => {
        dispatch(fetchAllContacts({
            page: currentPage,
            limit: 10,
            status: statusFilter,
            search: searchQuery
        }));
    };

    useEffect(() => {
        loadContacts();
    }, [currentPage, statusFilter]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                loadContacts();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Socket.io for real-time updates
    useEffect(() => {
        const socket = io(API_URL);

        socket.on("new-contact", (contact) => {
            dispatch(addNewContact(contact));
            toast({
                title: "New Contact Message",
                description: `New message from ${contact.name}`
            });
        });

        socket.on("contact-updated", (contact) => {
            dispatch(updateContactInList(contact));
        });

        socket.on("contact-deleted", (id) => {
            dispatch(removeContactFromList(id));
        });

        return () => socket.disconnect();
    }, [dispatch]);

    // Handle view contact
    const handleViewContact = (contact) => {
        dispatch(fetchContactById(contact._id));
        setAdminNotes(contact.adminNotes || "");
        setViewDialogOpen(true);
    };

    // Handle status change
    const handleStatusChange = async (contactId, newStatus) => {
        const result = await dispatch(updateContactStatus({ 
            id: contactId, 
            status: newStatus 
        }));
        
        if (updateContactStatus.fulfilled.match(result)) {
            toast({
                title: "Status Updated",
                description: `Contact marked as ${newStatus}`
            });
        }
    };

    // Handle save notes
    const handleSaveNotes = async () => {
        if (!currentContact) return;
        
        const result = await dispatch(updateContactStatus({ 
            id: currentContact._id, 
            adminNotes 
        }));
        
        if (updateContactStatus.fulfilled.match(result)) {
            toast({
                title: "Notes Saved",
                description: "Admin notes updated successfully"
            });
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!contactToDelete) return;

        const result = await dispatch(deleteContact(contactToDelete._id));
        
        if (deleteContact.fulfilled.match(result)) {
            toast({
                title: "Contact Deleted",
                description: "Contact message deleted successfully"
            });
            setDeleteDialogOpen(false);
            setContactToDelete(null);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedContacts.length === 0) return;

        const result = await dispatch(bulkDeleteContacts(selectedContacts));
        
        if (bulkDeleteContacts.fulfilled.match(result)) {
            toast({
                title: "Contacts Deleted",
                description: `${selectedContacts.length} contacts deleted successfully`
            });
            setSelectedContacts([]);
        }
    };

    // Handle select all
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedContacts(contacts.map(c => c._id));
        } else {
            setSelectedContacts([]);
        }
    };

    // Handle select single
    const handleSelectContact = (contactId, checked) => {
        if (checked) {
            setSelectedContacts(prev => [...prev, contactId]);
        } else {
            setSelectedContacts(prev => prev.filter(id => id !== contactId));
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Contact Messages</h1>
                    <p className="text-muted-foreground">
                        Manage contact form submissions from customers
                    </p>
                </div>
                <Button onClick={loadContacts} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-primary opacity-80" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600">New</p>
                                <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
                            </div>
                            <Mail className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600">Read</p>
                                <p className="text-2xl font-bold text-yellow-700">{stats.read}</p>
                            </div>
                            <MailOpen className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Replied</p>
                                <p className="text-2xl font-bold text-green-700">{stats.replied}</p>
                            </div>
                            <Reply className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 bg-gray-50/50">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Closed</p>
                                <p className="text-2xl font-bold text-gray-700">{stats.closed}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-gray-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                                <SelectItem value="replied">Replied</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        {selectedContacts.length > 0 && (
                            <Button 
                                variant="destructive" 
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete ({selectedContacts.length})
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Contacts Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No contact messages</p>
                            <p className="text-muted-foreground">
                                Contact form submissions will appear here
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedContacts.length === contacts.length && contacts.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contacts.map((contact) => {
                                    const StatusIcon = statusConfig[contact.status]?.icon || Mail;
                                    return (
                                        <TableRow 
                                            key={contact._id}
                                            className={contact.status === "new" ? "bg-blue-50/30" : ""}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedContacts.includes(contact._id)}
                                                    onCheckedChange={(checked) => 
                                                        handleSelectContact(contact._id, checked)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        {contact.name}
                                                        {contact.status === "new" && (
                                                            <span className="h-2 w-2 bg-blue-500 rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <Mail className="h-3 w-3" />
                                                        {contact.email}
                                                    </div>
                                                    {contact.company && (
                                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <Building2 className="h-3 w-3" />
                                                            {contact.company}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {contact.subject || "General Inquiry"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="secondary"
                                                    className={`${statusConfig[contact.status]?.color} text-white`}
                                                >
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {statusConfig[contact.status]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(contact.createdAt)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem 
                                                            onClick={() => handleViewContact(contact)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusChange(contact._id, "read")}
                                                        >
                                                            <MailOpen className="h-4 w-4 mr-2" />
                                                            Mark as Read
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusChange(contact._id, "replied")}
                                                        >
                                                            <Reply className="h-4 w-4 mr-2" />
                                                            Mark as Replied
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusChange(contact._id, "closed")}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Mark as Closed
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                setContactToDelete(contact);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Page {pagination.currentPage} of {pagination.totalPages} 
                                ({pagination.totalContacts} total)
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.hasMore}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Contact Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Contact Details</DialogTitle>
                        <DialogDescription>
                            View and manage this contact message
                        </DialogDescription>
                    </DialogHeader>
                    
                    {currentContact && (
                        <div className="space-y-6">
                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {currentContact.name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <a href={`mailto:${currentContact.email}`} className="text-primary hover:underline">
                                            {currentContact.email}
                                        </a>
                                    </p>
                                </div>
                                {currentContact.phone && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <a href={`tel:${currentContact.phone}`} className="text-primary hover:underline">
                                                {currentContact.phone}
                                            </a>
                                        </p>
                                    </div>
                                )}
                                {currentContact.company && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Company</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            {currentContact.company}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Subject */}
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Subject</p>
                                <p className="font-medium">{currentContact.subject || "General Inquiry"}</p>
                            </div>

                            {/* Message */}
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Message</p>
                                <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                                    {currentContact.message}
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Select 
                                        value={currentContact.status}
                                        onValueChange={(value) => handleStatusChange(currentContact._id, value)}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="read">Read</SelectItem>
                                            <SelectItem value="replied">Replied</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Received</p>
                                    <p className="text-sm">{formatDate(currentContact.createdAt)}</p>
                                </div>
                                {currentContact.repliedAt && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Replied</p>
                                        <p className="text-sm">{formatDate(currentContact.repliedAt)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Admin Notes</p>
                                <Textarea
                                    placeholder="Add internal notes about this contact..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                />
                                <Button 
                                    size="sm" 
                                    onClick={handleSaveNotes}
                                    disabled={adminNotes === (currentContact.adminNotes || "")}
                                >
                                    Save Notes
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Contact</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this contact message? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {contactToDelete && (
                        <div className="py-4">
                            <p><strong>From:</strong> {contactToDelete.name}</p>
                            <p><strong>Email:</strong> {contactToDelete.email}</p>
                            <p><strong>Subject:</strong> {contactToDelete.subject || "General Inquiry"}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminContacts;
