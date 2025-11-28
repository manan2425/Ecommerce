import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateProductPDF = (product) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(product?.title || "Product Details", 14, 22);

  // Price
  doc.setFontSize(14);
  doc.text(`Price: $${product?.price}`, 14, 32);
  if (product?.salePrice > 0) {
    doc.text(`Sale Price: $${product?.salePrice}`, 14, 40);
  }

  // Description
  doc.setFontSize(12);
  const splitDescription = doc.splitTextToSize(product?.description || "", 180);
  doc.text(splitDescription, 14, 50);

  // Parts Table (if applicable)
  if (product?.parts && product.parts.length > 0) {
    const partsData = product.parts.map(part => [
      part.name,
      part.description,
      `$${part.price}`
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70,
      head: [['Part Name', 'Description', 'Price']],
      body: partsData,
    });
  }

  doc.save(`${product?.title || "product"}_details.pdf`);
};

export const generateInvoicePDF = (orderDetails) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("INVOICE", 14, 22);

  doc.setFontSize(10);
  doc.text(`Order ID: ${orderDetails?._id}`, 14, 32);
  doc.text(`Date: ${new Date(orderDetails?.orderDate).toLocaleDateString()}`, 14, 38);
  doc.text(`Status: ${orderDetails?.orderStatus}`, 14, 44);

  // Customer Details
  doc.text("Bill To:", 14, 55);
  doc.setFontSize(12);
  doc.text(orderDetails?.addressInfo?.address || "", 14, 62);
  doc.text(`${orderDetails?.addressInfo?.city || ""} - ${orderDetails?.addressInfo?.pincode || ""}`, 14, 68);
  doc.text(`Phone: ${orderDetails?.addressInfo?.phone || ""}`, 14, 74);

  // Items Table
  const tableRows = [];
  orderDetails?.cartItems?.forEach(item => {
    const itemData = [
      item.title,
      item.quantity,
      `$${item.price}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    startY: 85,
    head: [['Item', 'Quantity', 'Unit Price', 'Total']],
    body: tableRows,
  });

  // Total Amount
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text(`Total Amount: $${orderDetails?.totalAmount}`, 14, finalY);

  doc.save(`invoice_${orderDetails?._id}.pdf`);
};
