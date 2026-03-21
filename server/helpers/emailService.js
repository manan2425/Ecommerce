import nodemailer from 'nodemailer';

// Admin email to receive notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mtronapp@gmail.com';

// Create transporter using Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // App password for Gmail
        }
    });
};

// Send email notification for new order
export const sendOrderNotification = async (order) => {
    try {
        const transporter = createTransporter();

        // Format cart items for email
        const itemsList = order.cartItems.map(item => {
            const itemName = item.selectedPart?.name || item.title;
            const itemPrice = item.selectedPart?.salePrice || item.selectedPart?.price || item.salePrice || item.price;
            return `• ${itemName} x ${item.quantity} - ₹${itemPrice}`;
        }).join('\n');

        const customerName = order.addressInfo?.name || 'Customer';
        const customerPhone = order.addressInfo?.phone || 'N/A';
        const customerAddress = `${order.addressInfo?.address || ''}, ${order.addressInfo?.city || ''} - ${order.addressInfo?.pincode || ''}`;
        const gstInfo = order.addressInfo?.gstNumber ? `\nGST Number: ${order.addressInfo.gstNumber}` : '';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ADMIN_EMAIL,
            subject: `🛒 New Order Received - Order #${order._id}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h1 style="color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                        🛒 New Order Received!
                    </h1>
                    
                    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #1e40af;">Order Details</h2>
                        <p><strong>Order ID:</strong> ${order._id}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString('en-IN')}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                        <p><strong>Order Status:</strong> ${order.orderStatus}</p>
                    </div>

                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #166534;">Customer Information</h2>
                        <p><strong>Name:</strong> ${customerName}</p>
                        <p><strong>Phone:</strong> ${customerPhone}</p>
                        <p><strong>Address:</strong> ${customerAddress}</p>
                        ${gstInfo ? `<p><strong>GST Number:</strong> ${order.addressInfo.gstNumber}</p>` : ''}
                        ${order.addressInfo?.notes ? `<p><strong>Notes:</strong> ${order.addressInfo.notes}</p>` : ''}
                    </div>

                    <div style="background-color: #fefce8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #854d0e;">Order Items</h2>
                        <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
                    </div>

                    <div style="background-color: #2563eb; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h2 style="margin: 0;">Total Amount: ₹${order.totalAmount}</h2>
                        ${order.gstAmount ? `<p style="margin: 5px 0 0 0;">GST: ₹${order.gstAmount}</p>` : ''}
                    </div>

                    <p style="text-align: center; color: #6b7280; font-size: 12px;">
                        This is an automated notification from SHREE MARUTI TRADERS
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('📧 Order notification email sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Error sending order notification email:', error);
        return false;
    }
};

// Send email notification for new service inquiry
export const sendServiceInquiryNotification = async (inquiry, service) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ADMIN_EMAIL,
            subject: `🔧 New Service Inquiry - ${service?.title || inquiry.serviceTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h1 style="color: #7c3aed; text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
                        🔧 New Service Inquiry!
                    </h1>
                    
                    <div style="background-color: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #6b21a8;">Service Details</h2>
                        <p><strong>Service:</strong> ${inquiry.serviceTitle}</p>
                        <p><strong>Category:</strong> ${inquiry.serviceCategory || 'N/A'}</p>
                        ${service?.price ? `<p><strong>Price:</strong> ₹${service.price} ${service.priceType ? `/ ${service.priceType}` : ''}</p>` : ''}
                    </div>

                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #166534;">Contact Information</h2>
                        <p><strong>Name:</strong> ${inquiry.name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
                        ${inquiry.phone ? `<p><strong>Phone:</strong> <a href="tel:${inquiry.phone}">${inquiry.phone}</a></p>` : ''}
                        ${inquiry.company ? `<p><strong>Company:</strong> ${inquiry.company}</p>` : ''}
                    </div>

                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #92400e;">Project Details</h2>
                        ${inquiry.budget ? `<p><strong>Budget:</strong> ${inquiry.budget}</p>` : ''}
                        ${inquiry.timeline ? `<p><strong>Timeline:</strong> ${inquiry.timeline}</p>` : ''}
                    </div>

                    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="margin: 0 0 10px 0; color: #334155;">Message</h2>
                        <p style="white-space: pre-wrap;">${inquiry.message}</p>
                    </div>

                    <div style="text-align: center; margin: 20px 0;">
                        <a href="mailto:${inquiry.email}?subject=Re: Service Inquiry - ${inquiry.serviceTitle}" 
                           style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Reply to Inquiry
                        </a>
                    </div>

                    <p style="text-align: center; color: #6b7280; font-size: 12px;">
                        This is an automated notification from SHREE MARUTI TRADERS
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('📧 Service inquiry notification email sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Error sending service inquiry notification email:', error);
        return false;
    }
};
