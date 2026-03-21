import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchAllServiceInquiries, 
    fetchServiceInquiryById,
    updateServiceInquiryStatus, 
    deleteServiceInquiry,
    bulkDeleteServiceInquiries,
    addNewInquiry,
    updateInquiryInList,
    removeInquiryFromList
} from "@/store/admin/service-inquiry-slice";
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
    Loader2,
    Wrench,
    Settings,
    DollarSign,
    Calendar
} from "lucide-react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const statusConfig = {
    new: { label: "New", color: "bg-blue-500", icon: Mail },
    read: { label: "Read", color: "bg-yellow-500", icon: MailOpen },
    replied: { label: "Replied", color: "bg-green-500", icon: Reply },
    closed: { label: "Closed", color: "bg-gray-500", icon: CheckCircle }
};

const AdminServiceInquiries = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { inquiries, pagination, stats, isLoading, currentInquiry } = useSelector(
        (state) => state.adminServiceInquiries
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInquiries, setSelectedInquiries] = useState([]);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");

    // Fetch inquiries
    const loadInquiries = () => {
        dispatch(fetchAllServiceInquiries({
            page: currentPage,
            limit: 10,
            status: statusFilter,
            search: searchQuery
        }));
    };

    useEffect(() => {
        loadInquiries();
    }, [currentPage, statusFilter]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                loadInquiries();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Socket.io for real-time updates
    useEffect(() => {
        const socket = io(API_URL);

        socket.on("new-service-inquiry", (inquiry) => {
            dispatch(addNewInquiry(inquiry));
            toast({
                title: "New Service Inquiry",
                description: `New inquiry from ${inquiry.name} for ${inquiry.serviceTitle}`
            });
        });

        socket.on("service-inquiry-updated", (inquiry) => {
            dispatch(updateInquiryInList(inquiry));
        });

        socket.on("service-inquiry-deleted", (id) => {
            dispatch(removeInquiryFromList(id));
        });

        return () => socket.disconnect();
    }, [dispatch]);

    // Handle view inquiry
    const handleViewInquiry = (inquiry) => {
        dispatch(fetchServiceInquiryById(inquiry._id));
        setAdminNotes(inquiry.adminNotes || "");
        setViewDialogOpen(true);
    };

    // Handle status change
    const handleStatusChange = async (inquiryId, newStatus) => {
        const result = await dispatch(updateServiceInquiryStatus({ 
            id: inquiryId, 
            status: newStatus 
        }));
        
        if (updateServiceInquiryStatus.fulfilled.match(result)) {
            toast({
                title: "Status Updated",
                description: `Inquiry marked as ${newStatus}`
            });
        }
    };

    // Handle save notes
    const handleSaveNotes = async () => {
        if (!currentInquiry) return;
        
        const result = await dispatch(updateServiceInquiryStatus({ 
            id: currentInquiry._id, 
            adminNotes 
        }));
        
        if (updateServiceInquiryStatus.fulfilled.match(result)) {
            toast({
                title: "Notes Saved",
                description: "Admin notes updated successfully"
            });
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!inquiryToDelete) return;

        const result = await dispatch(deleteServiceInquiry(inquiryToDelete._id));
        
        if (deleteServiceInquiry.fulfilled.match(result)) {
            toast({
                title: "Inquiry Deleted",
                description: "Service inquiry deleted successfully"
            });
            setDeleteDialogOpen(false);
            setInquiryToDelete(null);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedInquiries.length === 0) return;

        const result = await dispatch(bulkDeleteServiceInquiries(selectedInquiries));
        
        if (bulkDeleteServiceInquiries.fulfilled.match(result)) {
            toast({
                title: "Inquiries Deleted",
                description: `${selectedInquiries.length} inquiries deleted successfully`
            });
            setSelectedInquiries([]);
        }
    };

    // Handle select all
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedInquiries(inquiries.map(i => i._id));
        } else {
            setSelectedInquiries([]);
        }
    };

    // Handle select single
    const handleSelectInquiry = (inquiryId, checked) => {
        if (checked) {
            setSelectedInquiries(prev => [...prev, inquiryId]);
        } else {
            setSelectedInquiries(prev => prev.filter(id => id !== inquiryId));
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
                    <h1 className="text-3xl font-bold">Service Inquiries</h1>
                    <p className="text-muted-foreground">
                        Manage service inquiry submissions from customers
                    </p>
                </div>
                <Button onClick={loadInquiries} variant="outline" size="sm">
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
                            <Wrench className="h-8 w-8 text-primary opacity-80" />
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
                                placeholder="Search by name, email, service..."
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
                        {selectedInquiries.length > 0 && (
                            <Button 
                                variant="destructive" 
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete ({selectedInquiries.length})
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Inquiries Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : inquiries.length === 0 ? (
                        <div className="text-center py-12">
                            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No service inquiries</p>
                            <p className="text-muted-foreground">
                                Service inquiry submissions will appear here
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedInquiries.length === inquiries.length && inquiries.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map((inquiry) => {
                                    const StatusIcon = statusConfig[inquiry.status]?.icon || Mail;
                                    return (
                                        <TableRow 
                                            key={inquiry._id}
                                            className={inquiry.status === "new" ? "bg-blue-50/30" : ""}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedInquiries.includes(inquiry._id)}
                                                    onCheckedChange={(checked) => 
                                                        handleSelectInquiry(inquiry._id, checked)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        {inquiry.name}
                                                        {inquiry.status === "new" && (
                                                            <span className="h-2 w-2 bg-blue-500 rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <Mail className="h-3 w-3" />
                                                        {inquiry.email}
                                                    </div>
                                                    {inquiry.company && (
                                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <Building2 className="h-3 w-3" />
                                                            {inquiry.company}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium flex items-center gap-2">
                                                        <Settings className="h-4 w-4 text-primary" />
                                                        {inquiry.serviceTitle}
                                                    </div>
                                                    {inquiry.serviceCategory && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {inquiry.serviceCategory}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="secondary"
                                                    className={`${statusConfig[inquiry.status]?.color} text-white`}
                                                >
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {statusConfig[inquiry.status]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(inquiry.createdAt)}
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
                                                            onClick={() => handleViewInquiry(inquiry)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusChange(inquiry._id, "read")}
                                                        >
                                                            <MailOpen className="h-4 w-4 mr-2" />
                                                            Mark as Read
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusChange(inquiry._id, "replied")}
                                                        >
                                                            <Reply className="h-4 w-4 mr-2" />
                                                            Mark as Replied
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusChange(inquiry._id, "closed")}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Mark as Closed
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                setInquiryToDelete(inquiry);
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
                                ({pagination.totalInquiries} total)
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

            {/* View Inquiry Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Service Inquiry Details</DialogTitle>
                        <DialogDescription>
                            View and manage this service inquiry
                        </DialogDescription>
                    </DialogHeader>
                    
                    {currentInquiry && (
                        <div className="space-y-6">
                            {/* Service Info */}
                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                <div className="flex items-start gap-4">
                                    {currentInquiry.service?.image && (
                                        <img 
                                            src={currentInquiry.service.image} 
                                            alt={currentInquiry.serviceTitle}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Settings className="h-4 w-4 text-primary" />
                                            {currentInquiry.serviceTitle}
                                        </h3>
                                        {currentInquiry.serviceCategory && (
                                            <Badge variant="outline" className="mt-1">
                                                {currentInquiry.serviceCategory}
                                            </Badge>
                                        )}
                                        {currentInquiry.service?.price && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Price: ₹{currentInquiry.service.price.toLocaleString()}
                                                {currentInquiry.service.priceType && ` / ${currentInquiry.service.priceType}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {currentInquiry.name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <a href={`mailto:${currentInquiry.email}`} className="text-primary hover:underline">
                                            {currentInquiry.email}
                                        </a>
                                    </p>
                                </div>
                                {currentInquiry.phone && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <a href={`tel:${currentInquiry.phone}`} className="text-primary hover:underline">
                                                {currentInquiry.phone}
                                            </a>
                                        </p>
                                    </div>
                                )}
                                {currentInquiry.company && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Company</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            {currentInquiry.company}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Budget & Timeline */}
                            {(currentInquiry.budget || currentInquiry.timeline) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {currentInquiry.budget && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Budget</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                {currentInquiry.budget}
                                            </p>
                                        </div>
                                    )}
                                    {currentInquiry.timeline && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Timeline</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {currentInquiry.timeline}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Message */}
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Message</p>
                                <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                                    {currentInquiry.message}
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Select 
                                        value={currentInquiry.status}
                                        onValueChange={(value) => handleStatusChange(currentInquiry._id, value)}
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
                                    <p className="text-sm">{formatDate(currentInquiry.createdAt)}</p>
                                </div>
                                {currentInquiry.repliedAt && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Replied</p>
                                        <p className="text-sm">{formatDate(currentInquiry.repliedAt)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Admin Notes</p>
                                <Textarea
                                    placeholder="Add internal notes about this inquiry..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                />
                                <Button 
                                    size="sm" 
                                    onClick={handleSaveNotes}
                                    disabled={adminNotes === (currentInquiry.adminNotes || "")}
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
                        <DialogTitle>Delete Service Inquiry</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this service inquiry? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {inquiryToDelete && (
                        <div className="py-4">
                            <p><strong>From:</strong> {inquiryToDelete.name}</p>
                            <p><strong>Email:</strong> {inquiryToDelete.email}</p>
                            <p><strong>Service:</strong> {inquiryToDelete.serviceTitle}</p>
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

export default AdminServiceInquiries;
