import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserServiceInquiries } from "@/store/shop/service-slice";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { 
    MessageSquare, 
    Clock, 
    CheckCircle, 
    Loader2, 
    Eye, 
    Calendar, 
    DollarSign,
    FileText,
    Wrench,
    MailOpen
} from "lucide-react";

const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
        case 'new':
            return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs">New</Badge>;
        case 'read':
            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs">Read</Badge>;
        case 'replied':
            return <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs">Replied</Badge>;
        case 'closed':
            return <Badge className="bg-gray-500 hover:bg-gray-600 text-white font-bold text-xs">Closed</Badge>;
        default:
            return <Badge className="bg-slate-500 text-white font-bold text-xs">{status || "Pending"}</Badge>;
    }
};

export default function UserServiceInquiries() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { userInquiries, isLoading } = useSelector(state => state.shopServices);
    
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (user?.email) {
            dispatch(fetchUserServiceInquiries(user.email));
        }
    }, [dispatch, user]);

    const handleViewDetails = (inquiry) => {
        setSelectedInquiry(inquiry);
        setDialogOpen(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <Card className="glass border-none">
            <CardHeader>
                <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Service Inquiry History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !userInquiries || userInquiries.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No inquiries found</p>
                        <p className="text-sm">Submit an inquiry on the Services page to get started!</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-800">
                                <TableHead className="text-primary font-bold">Service Title</TableHead>
                                <TableHead className="text-primary font-bold">Date Submitted</TableHead>
                                <TableHead className="text-primary font-bold">Status</TableHead>
                                <TableHead className="text-primary font-bold text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userInquiries.map((inquiry) => (
                                <TableRow key={inquiry._id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="font-semibold">{inquiry.serviceTitle}</TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {inquiry.createdAt ? inquiry.createdAt.split("T")[0] : ""}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="hover:bg-primary hover:text-white transition-colors gap-1.5"
                                            onClick={() => handleViewDetails(inquiry)}
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Inquiry Details Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl p-8 bg-mesh">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl font-black text-slate-900">
                                <MessageSquare className="h-6 w-6 text-primary" />
                                Service Inquiry Details
                            </DialogTitle>
                            <DialogDescription className="text-slate-500">
                                View details and current response status of your inquiry.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedInquiry && (
                            <div className="space-y-6 mt-4">
                                {/* Service Info Card */}
                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                                        <Wrench className="h-4 w-4 text-primary" />
                                        {selectedInquiry.serviceTitle}
                                    </h3>
                                    {selectedInquiry.serviceCategory && (
                                        <p className="text-sm text-slate-500 mt-1 italic">
                                            Category: {selectedInquiry.serviceCategory}
                                        </p>
                                    )}
                                </div>

                                {/* Inquiry Meta Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Range</p>
                                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                                            <DollarSign className="h-4 w-4 text-slate-500" />
                                            {selectedInquiry.budget || "Not provided"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</p>
                                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            {selectedInquiry.timeline || "Not provided"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Date</p>
                                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                                            <Clock className="h-4 w-4 text-slate-500" />
                                            {formatDate(selectedInquiry.createdAt)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                        <div className="pt-0.5">{getStatusBadge(selectedInquiry.status)}</div>
                                    </div>
                                </div>

                                {/* Requirements Details */}
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Requirements</p>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto">
                                        {selectedInquiry.message}
                                    </div>
                                </div>

                                {/* Admin Response / Notes */}
                                {selectedInquiry.adminNotes && (
                                    <div className="space-y-2 border-t border-dashed border-slate-200 pt-4">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                                            <MailOpen className="h-4 w-4 text-primary" />
                                            Response from Specialists
                                        </p>
                                        <div className="bg-green-50/70 p-4 rounded-xl border border-green-100 text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                                            {selectedInquiry.adminNotes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter className="mt-6">
                            <Button className="rounded-xl font-bold w-full" onClick={() => setDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
