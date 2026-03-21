import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Company Details Configuration
const COMPANY_INFO = {
  name: "SHREE MARUTI TRADERS",
  tagline: "Industrial Automation & Control Solutions",
  address: "Plot 59, Shop 6, Aarogyajyoti Pharmacy",
  area: "GIDC, V.U. Nagar",
  city: "Anand",
  state: "Gujarat",
  pincode: "388121",
  country: "India",
  phone1: "+91 78743 93297",
  phone1Name: "Rushil Sevak",
  phone2: "+91 89882 99522",
  phone2Name: "Anish Sharma",
  email: "mtronapp@gmail.com",
  website: "www.mechatronsolutions.com",
  gstin: "24AHLPS6771N1ZH",
  pan: "AHLPS6771N",
  stateCode: "24",
  bankName: "State Bank of India",
  accountNo: "XXXXXXXXXX",
  ifsc: "SBIN0XXXXXX",
  branch: "V.U. Nagar Branch",
  logoUrl: "/company_logo.png"
};

// Helper to convert price string/number to proper number
const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    // Remove currency symbols and commas
    const cleaned = price.replace(/[₹$,\s]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

// Format currency in Indian Rupees (compact for PDF)
const formatCurrency = (amount) => {
  const num = parsePrice(amount);
  if (isNaN(num)) return "₹0.00";
  // Use compact format without decimal for whole numbers
  if (num >= 100000) {
    // For lakhs and above, show in lakhs format
    return "₹" + new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(num);
  }
  return "₹" + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// Load image and convert to base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

// Format date in Indian format
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Generate Invoice Number
const generateInvoiceNumber = (orderId, orderDate) => {
  const date = new Date(orderDate);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const shortId = orderId?.slice(-6)?.toUpperCase() || "000000";
  return `SMT/${year}${month}/${shortId}`;
};

// Number to words for Indian currency
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  if (num === 0) return 'Zero';
  
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remaining = Math.floor(num % 1000);
  const paise = Math.round((num % 1) * 100);

  let words = '';
  if (crore) words += convertLessThanThousand(crore) + ' Crore ';
  if (lakh) words += convertLessThanThousand(lakh) + ' Lakh ';
  if (thousand) words += convertLessThanThousand(thousand) + ' Thousand ';
  if (remaining) words += convertLessThanThousand(remaining);
  
  words = words.trim() + ' Rupees';
  if (paise > 0) words += ' and ' + convertLessThanThousand(paise) + ' Paise';
  words += ' Only';
  
  return words;
};

export const generateProductPDF = async (product) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Load logo
  let logoBase64 = null;
  try {
    logoBase64 = await loadImageAsBase64(COMPANY_INFO.logoUrl);
  } catch (error) {
    console.log('Could not load logo');
  }

  // Header with company name
  doc.setFillColor(51, 65, 85); // Slate color
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo
  if (logoBase64) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(8, 5, 32, 32, 2, 2, 'F');
    doc.addImage(logoBase64, 'PNG', 10, 7, 28, 28);
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, logoBase64 ? 46 : 14, 16);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY_INFO.tagline, logoBase64 ? 46 : 14, 24);
  doc.text(`${COMPANY_INFO.phone1} | ${COMPANY_INFO.email}`, logoBase64 ? 46 : 14, 32);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Product Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(product?.title || "Product Details", 14, 55);

  // Product Info Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 60, pageWidth - 28, 30, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`MRP: ${formatCurrency(parsePrice(product?.price))}`, 20, 72);
  if (parsePrice(product?.salePrice) > 0) {
    doc.setTextColor(22, 163, 74);
    doc.text(`Sale Price: ${formatCurrency(parsePrice(product?.salePrice))}`, 20, 82);
    doc.setTextColor(0, 0, 0);
  }
  if (product?.brand) {
    doc.text(`Brand: ${product.brand}`, 110, 72);
  }
  if (product?.category) {
    doc.text(`Category: ${product.category}`, 110, 82);
  }

  // Description
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Description", 14, 105);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const splitDescription = doc.splitTextToSize(product?.description || "No description available", 180);
  doc.text(splitDescription, 14, 115);

  // Parts Table (if applicable)
  if (product?.parts && product.parts.length > 0) {
    const partsData = product.parts.map((part, index) => [
      index + 1,
      part.name,
      part.description || '-',
      formatCurrency(parsePrice(part.price))
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 140,
      head: [['#', 'Part Name', 'Description', 'Price']],
      body: partsData,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15 },
        3: { halign: 'right' }
      }
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`${COMPANY_INFO.name} | ${COMPANY_INFO.email} | ${COMPANY_INFO.phone1}`, pageWidth / 2, footerY, { align: 'center' });

  doc.save(`${product?.title || "product"}_details.pdf`);
};

export const generateInvoicePDF = async (orderDetails) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const invoiceNumber = generateInvoiceNumber(orderDetails?._id, orderDetails?.orderDate);
  const isGSTBill = orderDetails?.addressInfo?.wantsGstBill && orderDetails?.addressInfo?.gstNumber;

  // ========== LOAD LOGO ==========
  let logoBase64 = null;
  try {
    logoBase64 = await loadImageAsBase64(COMPANY_INFO.logoUrl);
  } catch (error) {
    console.log('Could not load logo, using text placeholder');
  }

  // ========== HEADER SECTION ==========
  doc.setFillColor(51, 65, 85);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Company Logo
  if (logoBase64) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(8, 5, 32, 32, 2, 2, 'F');
    doc.addImage(logoBase64, 'PNG', 9, 6, 30, 30);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(8, 5, 32, 32, 2, 2, 'F');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SMT", 17, 22);
  }

  // Company Details
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, 45, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${COMPANY_INFO.address}, ${COMPANY_INFO.area}, ${COMPANY_INFO.city} - ${COMPANY_INFO.pincode}`, 45, 21);
  doc.text(`Phone: ${COMPANY_INFO.phone1} | Email: ${COMPANY_INFO.email}`, 45, 28);
  doc.setFont("helvetica", "bold");
  doc.text(`GSTIN: ${COMPANY_INFO.gstin}  |  State: ${COMPANY_INFO.state} (${COMPANY_INFO.stateCode})`, 45, 35);

  // Invoice Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(isGSTBill ? "TAX INVOICE" : "INVOICE", pageWidth - 12, 16, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`No: ${invoiceNumber}`, pageWidth - 12, 26, { align: 'right' });
  doc.text(`Date: ${formatDate(orderDetails?.orderDate)}`, pageWidth - 12, 34, { align: 'right' });

  doc.setTextColor(0, 0, 0);

  // ========== CUSTOMER DETAILS ==========
  let yPos = 50;
  
  // Bill To
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(10, yPos, 92, 38, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("BILL TO:", 14, yPos + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  const customerName = orderDetails?.addressInfo?.address?.split(',')[0] || "Customer";
  doc.setFont("helvetica", "bold");
  doc.text(customerName.substring(0, 35), 14, yPos + 16);
  doc.setFont("helvetica", "normal");
  
  const fullAddress = orderDetails?.addressInfo?.address || "";
  const addressText = doc.splitTextToSize(fullAddress, 85);
  doc.setFontSize(8);
  doc.text(addressText.slice(0, 2), 14, yPos + 22);
  doc.text(`${orderDetails?.addressInfo?.city || ""} - ${orderDetails?.addressInfo?.pincode || ""}`, 14, yPos + 32);

  // Ship To
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(108, yPos, 92, 38, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("SHIP TO:", 112, yPos + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(customerName.substring(0, 35), 112, yPos + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(addressText.slice(0, 2), 112, yPos + 22);
  doc.text(`Ph: ${orderDetails?.addressInfo?.phone || ""}`, 112, yPos + 32);

  yPos += 42;

  // Customer GST (if applicable)
  if (isGSTBill && orderDetails?.addressInfo?.gstNumber) {
    doc.setFillColor(254, 249, 195);
    doc.roundedRect(10, yPos, pageWidth - 20, 10, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(161, 98, 7);
    doc.text(`Customer GSTIN: ${orderDetails?.addressInfo?.gstNumber}`, 14, yPos + 7);
    yPos += 14;
  }

  // Order Info Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(10, yPos, pageWidth - 20, 10, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text(`Order: ${orderDetails?._id?.slice(-8)?.toUpperCase() || ""}`, 14, yPos + 7);
  doc.text(`Payment: ${orderDetails?.paymentMethod || "COD"}`, 70, yPos + 7);
  doc.text(`Status: ${orderDetails?.orderStatus || "Pending"}`, 120, yPos + 7);
  doc.text(`${orderDetails?.paymentStatus || ""}`, 165, yPos + 7);

  yPos += 15;

  // ========== ITEMS TABLE WITH GST ==========
  let calculatedSubtotal = 0;
  const GST_RATE = 18;
  const tableBody = [];
  let srNo = 1;
  
  orderDetails?.cartItems?.forEach(item => {
    let itemName = item.title || "Product";
    
    if (item?.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      const opts = Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ');
      itemName += ` (${opts})`;
    }
    if (item?.selectedPart?.name) {
      itemName += ` - ${item.selectedPart.name}`;
    }

    const unitPrice = parsePrice(item.salePrice) > 0 ? parsePrice(item.salePrice) : parsePrice(item.price);
    const qty = parseInt(item.quantity) || 1;
    const lineTotal = unitPrice * qty;
    
    // For GST bill, show taxable value (price before GST)
    const taxableValue = isGSTBill ? (lineTotal / 1.18) : lineTotal;
    const itemGST = isGSTBill ? (lineTotal - taxableValue) : 0;
    
    calculatedSubtotal += lineTotal;

    if (isGSTBill) {
      tableBody.push([
        srNo++,
        itemName.substring(0, 45),
        "85044090",
        qty,
        formatCurrency(unitPrice / 1.18),
        formatCurrency(taxableValue),
        `${GST_RATE}%`,
        formatCurrency(itemGST),
        formatCurrency(lineTotal)
      ]);
    } else {
      tableBody.push([
        srNo++,
        itemName.substring(0, 50),
        qty,
        formatCurrency(unitPrice),
        formatCurrency(lineTotal)
      ]);
    }
  });

  // Table headers based on GST or non-GST
  const tableHead = isGSTBill 
    ? [['#', 'Description', 'HSN', 'Qty', 'Rate', 'Taxable', 'GST%', 'GST Amt', 'Total']]
    : [['#', 'Description', 'Qty', 'Unit Price', 'Amount']];

  const columnStyles = isGSTBill ? {
    0: { cellWidth: 8, halign: 'center' },
    1: { cellWidth: 50 },
    2: { cellWidth: 18, halign: 'center' },
    3: { cellWidth: 12, halign: 'center' },
    4: { cellWidth: 22, halign: 'right' },
    5: { cellWidth: 22, halign: 'right' },
    6: { cellWidth: 14, halign: 'center' },
    7: { cellWidth: 20, halign: 'right' },
    8: { cellWidth: 24, halign: 'right' }
  } : {
    0: { cellWidth: 12, halign: 'center' },
    1: { cellWidth: 90 },
    2: { cellWidth: 20, halign: 'center' },
    3: { cellWidth: 35, halign: 'right' },
    4: { cellWidth: 35, halign: 'right' }
  };

  autoTable(doc, {
    startY: yPos,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: { 
      fillColor: [51, 65, 85], 
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 2,
      valign: 'middle'
    },
    columnStyles: columnStyles,
    styles: {
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      font: 'helvetica'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // ========== TOTALS SECTION ==========
  let totalsY = doc.lastAutoTable.finalY + 5;
  
  // Calculate final values
  const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : parsePrice(orderDetails?.totalAmount);
  const taxableAmount = isGSTBill ? (subtotal / 1.18) : subtotal;
  const totalGST = isGSTBill ? (subtotal - taxableAmount) : (parsePrice(orderDetails?.gstAmount) || 0);
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;
  const grandTotal = subtotal;

  // Amount in Words (Left Side)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Amount in Words:", 12, totalsY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const words = numberToWords(grandTotal);
  const wordLines = doc.splitTextToSize(words, 80);
  doc.text(wordLines, 12, totalsY + 12);

  // Totals Table (Right Side) - Using autoTable for proper alignment
  const totalsData = [];
  
  if (isGSTBill) {
    totalsData.push(['Taxable Amount', formatCurrency(taxableAmount)]);
    totalsData.push(['CGST (9%)', formatCurrency(cgst)]);
    totalsData.push(['SGST (9%)', formatCurrency(sgst)]);
    totalsData.push(['Total GST (18%)', formatCurrency(totalGST)]);
  }
  totalsData.push(['GRAND TOTAL', formatCurrency(grandTotal)]);

  autoTable(doc, {
    startY: totalsY,
    body: totalsData,
    theme: 'plain',
    tableWidth: 70,
    margin: { left: pageWidth - 78 },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica'
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'normal', halign: 'left' },
      1: { cellWidth: 32, fontStyle: 'bold', halign: 'right' }
    },
    didParseCell: function(data) {
      // Style the last row (Grand Total) differently
      if (data.row.index === totalsData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
        if (data.column.index === 1) {
          data.cell.styles.textColor = [21, 128, 61]; // Green color
        }
      }
      // Style GST row in orange
      if (isGSTBill && data.row.index === 3 && data.column.index === 1) {
        data.cell.styles.textColor = [194, 65, 12];
      }
    },
    willDrawCell: function(data) {
      // Add background and border to the totals area
      if (data.row.index === 0 && data.column.index === 0) {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        const tableHeight = totalsData.length * 10 + 4;
        doc.roundedRect(pageWidth - 80, totalsY - 2, 72, tableHeight, 2, 2, 'FD');
      }
    }
  });

  totalsY = doc.lastAutoTable.finalY + 5;

  // ========== BANK DETAILS ==========
  if (isGSTBill) {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(10, totalsY, 80, 28, 2, 2, 'FD');
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);
    doc.text("Bank Details", 14, totalsY + 7);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.text(`Bank: ${COMPANY_INFO.bankName}`, 14, totalsY + 14);
    doc.text(`A/C: ${COMPANY_INFO.accountNo}`, 14, totalsY + 20);
    doc.text(`IFSC: ${COMPANY_INFO.ifsc}`, 14, totalsY + 26);
    
    totalsY += 32;
  }

  // ========== TERMS & SIGNATURE ==========
  const footerStartY = Math.max(totalsY + 5, pageHeight - 55);
  
  doc.setDrawColor(229, 231, 235);
  doc.line(10, footerStartY - 3, pageWidth - 10, footerStartY - 3);
  
  // Terms
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("Terms & Conditions:", 12, footerStartY + 3);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(107, 114, 128);
  const terms = [
    "1. Goods once sold will not be taken back.",
    "2. Subject to Anand jurisdiction only.",
    "3. Payment due within 30 days.",
    "4. E. & O.E."
  ];
  terms.forEach((t, i) => doc.text(t, 12, footerStartY + 9 + (i * 4)));

  // Signature
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`For ${COMPANY_INFO.name}`, pageWidth - 55, footerStartY + 5);
  
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth - 55, footerStartY + 20, pageWidth - 12, footerStartY + 20);
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signatory", pageWidth - 45, footerStartY + 26);

  // ========== FOOTER ==========
  doc.setFillColor(51, 65, 85);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`${COMPANY_INFO.name} | ${COMPANY_INFO.email} | ${COMPANY_INFO.phone1}`, pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Save
  doc.save(`Invoice_${invoiceNumber.replace(/\//g, '-')}.pdf`);
  return invoiceNumber;
};

// Generate Quotation PDF
export const generateQuotationPDF = async (items, customerInfo = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const quotationNumber = `SMT/QT/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;

  // Load logo
  let logoBase64 = null;
  try {
    logoBase64 = await loadImageAsBase64(COMPANY_INFO.logoUrl);
  } catch (error) {
    console.log('Could not load logo');
  }

  // Header
  doc.setFillColor(51, 65, 85);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo
  if (logoBase64) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(8, 6, 34, 34, 2, 2, 'F');
    doc.addImage(logoBase64, 'PNG', 10, 8, 30, 30);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, logoBase64 ? 48 : 14, 15);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${COMPANY_INFO.address}, ${COMPANY_INFO.area}, ${COMPANY_INFO.city} - ${COMPANY_INFO.pincode}`, logoBase64 ? 48 : 14, 23);
  doc.text(`Phone: ${COMPANY_INFO.phone1} | Email: ${COMPANY_INFO.email}`, logoBase64 ? 48 : 14, 30);
  doc.text(`GSTIN: ${COMPANY_INFO.gstin}`, logoBase64 ? 48 : 14, 37);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth - 14, 20, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`No: ${quotationNumber}`, pageWidth - 14, 28, { align: 'right' });
  doc.text(`Date: ${formatDate(new Date())}`, pageWidth - 14, 35, { align: 'right' });

  doc.setTextColor(0, 0, 0);

  // Customer Info
  let yPos = 55;
  if (customerInfo.name || customerInfo.company) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(10, yPos, pageWidth - 20, 25, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("To:", 14, yPos + 8);
    doc.setFont("helvetica", "normal");
    doc.text(customerInfo.company || customerInfo.name || "", 25, yPos + 8);
    if (customerInfo.address) doc.text(customerInfo.address, 14, yPos + 15);
    if (customerInfo.phone) doc.text(`Phone: ${customerInfo.phone}`, 14, yPos + 22);
    
    yPos += 30;
  }

  // Items Table - use parsePrice for proper handling
  const tableRows = items.map((item, index) => [
    index + 1,
    item.title || item.name || "",
    item.quantity || 1,
    formatCurrency(parsePrice(item.price)),
    formatCurrency(parsePrice(item.price) * (item.quantity || 1))
  ]);

  const total = items.reduce((sum, item) => sum + (parsePrice(item.price) * (item.quantity || 1)), 0);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableRows,
    foot: [['', '', '', 'Total:', formatCurrency(total)]],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 9 },
    footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 10 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    }
  });

  // Validity Note
  const noteY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Note:", 14, noteY);
  doc.setFont("helvetica", "normal");
  doc.text("• This quotation is valid for 15 days from the date of issue.", 14, noteY + 7);
  doc.text("• Prices are exclusive of GST (18%) unless otherwise mentioned.", 14, noteY + 14);
  doc.text("• Delivery within 7-10 working days after order confirmation.", 14, noteY + 21);

  // Footer
  doc.setFillColor(51, 65, 85);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(`${COMPANY_INFO.name} | ${COMPANY_INFO.email} | ${COMPANY_INFO.phone1}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

  doc.save(`Quotation_${quotationNumber.replace(/\//g, '-')}.pdf`);
  
  return quotationNumber;
};
