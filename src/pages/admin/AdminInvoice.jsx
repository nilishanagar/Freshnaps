import React, { useState, useRef } from 'react';
import { Plus, Trash2, Printer, FileText, Upload, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── number → Indian words ─── */
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numToWords(n) {
  if (n === 0) return 'Zero';
  if (n < 0) return 'Minus ' + numToWords(-n);
  let str = '';
  if (n >= 10000000) { str += numToWords(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
  if (n >= 100000)   { str += numToWords(Math.floor(n / 100000)) + ' Lakh ';   n %= 100000; }
  if (n >= 1000)     { str += numToWords(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
  if (n >= 100)      { str += numToWords(Math.floor(n / 100)) + ' Hundred ';   n %= 100; }
  if (n >= 20)       { str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : ''); }
  else if (n > 0)    { str += ones[n]; }
  return str.trim();
}

const defaultCompany = {
  name:    'ROOPLAXMI FURNITURE',
  address: 'Mandi Road, Sawai Madhopur',
  mobile:  '9414045376',
  gstin:   '08AEBPG6497C1ZJ',
};

const defaultBank = {
  details: 'AU Small Finance Bank, SAWAI MADHOPUR',
  ifsc:    'AUBL0002254',
  acc:     '2221225437547561',
};

const emptyItem = () => ({ desc: '', qty: '', unit: 'pcs', rate: '', amount: '' });

export default function AdminInvoice() {
  const printRef = useRef(null);

  /* ── form state ── */
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-IN'));
  const [buyerName, setBuyerName] = useState('');
  const [buyerMobile, setBuyerMobile] = useState('');
  const [buyerGstin, setBuyerGstin] = useState('');
  const [stateName, setStateName] = useState('RAJASTHAN');
  const [stateCode, setStateCode] = useState('08');
  const [placeOfSupply, setPlaceOfSupply] = useState('RAJASTHAN');
  const [noteText, setNoteText] = useState('GST EXTRA');
  const [items, setItems] = useState([emptyItem()]);
  const [mobileError, setMobileError] = useState('');
  const [itemErrors, setItemErrors] = useState({});

  /* ── company details state ── */
  const [companyName, setCompanyName] = useState(defaultCompany.name);
  const [companyAddress, setCompanyAddress] = useState(defaultCompany.address);
  const [companyMobile, setCompanyMobile] = useState(defaultCompany.mobile);
  const [companyGstin, setCompanyGstin] = useState(defaultCompany.gstin);

  /* ── bank details state ── */
  const [bankDetails, setBankDetails] = useState(defaultBank.details);
  const [bankIfsc, setBankIfsc] = useState(defaultBank.ifsc);
  const [bankAcc, setBankAcc] = useState(defaultBank.acc);

  /* ── mobile validation ── */
  const handleMobileChange = (val) => {
    // Only allow digits
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setBuyerMobile(digits);
    if (digits.length > 0 && digits.length < 10) {
      setMobileError('Mobile number must be exactly 10 digits.');
    } else {
      setMobileError('');
    }
  };

  /* ── signature ── */
  const [sigUrl, setSigUrl] = useState(null);
  const sigRef = useRef(null);

  const handleSigUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSigUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearSig = () => {
    setSigUrl(null);
    if (sigRef.current) sigRef.current.value = '';
  };

  /* ── item helpers ── */
  const MAX_RATE = 9_999_999;  // 7-digit cap
  const MAX_QTY  = 9_999;      // 4-digit cap

  const updateItem = (i, field, val) => {
    // Cap numeric inputs
    if (field === 'rate' && parseFloat(val) > MAX_RATE) val = String(MAX_RATE);
    if (field === 'qty'  && parseFloat(val) > MAX_QTY)  val = String(MAX_QTY);

    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    // Auto-calc amount
    if (field === 'qty' || field === 'rate') {
      const q = parseFloat(field === 'qty' ? val : next[i].qty) || 0;
      const r = parseFloat(field === 'rate' ? val : next[i].rate) || 0;
      const computed = q && r ? Math.min(q * r, 99_999_999) : 0;  // 8-digit max
      next[i].amount = computed ? computed.toFixed(0) : '';
    }
    // Flag amount overflow
    if (field === 'amount') {
      const amt = parseFloat(val) || 0;
      setItemErrors(prev => ({ ...prev, [i]: amt > 99_999_999 ? 'Amount too large for invoice.' : '' }));
      if (parseFloat(val) > 99_999_999) val = '99999999';
      next[i].amount = val;
    } else {
      // Re-validate auto-computed amount
      const autoAmt = parseFloat(next[i].amount) || 0;
      setItemErrors(prev => ({ ...prev, [i]: autoAmt > 99_999_999 ? 'Amount too large.' : '' }));
    }
    setItems(next);
  };

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const total = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
  const totalWords = numToWords(Math.round(total)) + ' only';
  const hasErrors = mobileError || Object.values(itemErrors).some(Boolean);

  /* ── print (with validation gate) ── */
  const handlePrint = () => {
    if (buyerMobile && buyerMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number before printing.');
      return;
    }
    if (Object.values(itemErrors).some(Boolean)) {
      toast.error('Fix the highlighted amount errors before printing.');
      return;
    }
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Invoice ${invoiceNo}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; color: #000; margin: 30px; }
        h1 { text-align:center; font-size: 22px; text-decoration: underline; margin:0; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #000; padding: 5px 8px; }
        th { background: #f3f3f3; font-weight: bold; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 32px; margin: 12px 0; }
        .label { font-weight: bold; }
        .bank-box { border: 1px solid #000; padding: 8px 12px; margin: 10px 0; }
        .sign-section { text-align: right; margin-top: 30px; }
        .sign-box { display: inline-block; width: 180px; height: 80px; border: 1px solid #999; border-radius:4px; }
        @media print { @page { margin: 18mm; } }
      </style></head><body>${printContent}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  /* ── UI ── */
  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50 dark:bg-surface-950">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={26} className="text-primary-500" /> Invoice Generator
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create and print professional invoices</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient text-white text-sm font-bold rounded-xl shadow-brand hover:shadow-brand-lg transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Printer size={16} /> Print / Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

        {/* ── LEFT: Edit Form ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Invoice Info */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-200 dark:border-surface-800 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-surface-800 pb-3">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice No.</label>
                <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="e.g. FN-001"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</label>
                <input value={date} onChange={e => setDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-200 dark:border-surface-800 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-surface-800 pb-3">Company Details</h3>
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company / Brand Name</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. ROOPLAXMI FURNITURE"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</label>
              <input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Address"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobile No.</label>
                <input value={companyMobile} onChange={e => setCompanyMobile(e.target.value)} placeholder="Mobile No"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GSTIN</label>
                <input value={companyGstin} onChange={e => setCompanyGstin(e.target.value)} placeholder="GSTIN"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-200 dark:border-surface-800 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-surface-800 pb-3">Bank Details</h3>
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bank Name & Branch</label>
              <input value={bankDetails} onChange={e => setBankDetails(e.target.value)} placeholder="AU Small Finance Bank, SAWAI MADHOPUR"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IFSC Code</label>
                <input value={bankIfsc} onChange={e => setBankIfsc(e.target.value)} placeholder="IFSC Code"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Number</label>
                <input value={bankAcc} onChange={e => setBankAcc(e.target.value)} placeholder="Account Number"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
            </div>
          </div>

          {/* Buyer Info */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-200 dark:border-surface-800 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-surface-800 pb-3">Buyer Details</h3>
            <div>
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Buyer Name</label>
              <input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="e.g. TAJ SAWAI, Ranthambore"
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobile No.</label>
                <input
                  value={buyerMobile}
                  onChange={e => handleMobileChange(e.target.value)}
                  placeholder="10-digit number"
                  maxLength={10}
                  inputMode="numeric"
                  className={`mt-1 w-full px-3 py-2 text-sm rounded-lg border bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                    mobileError
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'border-gray-200 dark:border-surface-700 focus:ring-primary-500/50'
                  }`}
                />
                {mobileError && (
                  <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle size={10} /> {mobileError}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GSTIN/UIN</label>
                <input value={buyerGstin} onChange={e => setBuyerGstin(e.target.value)} placeholder="Optional"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">State Name</label>
                <input value={stateName} onChange={e => setStateName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">State Code</label>
                <input value={stateCode} onChange={e => setStateCode(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Place of Supply</label>
                <input value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-200 dark:border-surface-800 p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-surface-800 pb-3">Note (Optional)</h3>
            <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="e.g. GST EXTRA"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>

          {/* Signature Upload */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-200 dark:border-surface-800 p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-surface-800 pb-3">Authorised Signature</h3>
            {sigUrl ? (
              <div className="relative">
                <img src={sigUrl} alt="Signature" className="max-h-24 object-contain border border-gray-200 dark:border-surface-700 rounded-lg p-2 bg-white w-full" />
                <button
                  onClick={clearSig}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => sigRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 dark:border-surface-700 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-all cursor-pointer"
              >
                <Upload size={22} />
                <span className="text-xs font-bold">Click to upload signature</span>
                <span className="text-[10px] opacity-60">PNG / JPG / SVG recommended</span>
              </button>
            )}
            <input
              ref={sigRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSigUpload}
            />
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        <div className="xl:col-span-3">

          {/* Line Items Editor */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-gray-200 dark:border-surface-800 p-5 mb-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-surface-800 pb-3 mb-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Line Items</h3>
              <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 transition-colors">
                <Plus size={13} /> Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="pb-2 pr-2">#</th>
                    <th className="pb-2 pr-2 min-w-[180px]">Description</th>
                    <th className="pb-2 pr-2 w-16">Qty</th>
                    <th className="pb-2 pr-2 w-16">Unit</th>
                    <th className="pb-2 pr-2 w-24">Rate (₹)</th>
                    <th className="pb-2 pr-2 w-24">Amount (₹)</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-surface-800">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-2 text-gray-400 font-bold">{i + 1}.</td>
                      <td className="py-2 pr-2">
                        <input value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)} placeholder="Item description..."
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-xs" />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          value={item.qty}
                          onChange={e => updateItem(i, 'qty', e.target.value)}
                          placeholder="1"
                          type="number"
                          min="0"
                          max="9999"
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-xs"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none text-xs">
                          <option>pcs</option>
                          <option>RFT</option>
                          <option>sqft</option>
                          <option>set</option>
                          <option>nos</option>
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          value={item.rate}
                          onChange={e => updateItem(i, 'rate', e.target.value)}
                          placeholder="0"
                          type="number"
                          min="0"
                          max="9999999"
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-surface-700 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 text-xs"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          value={item.amount}
                          onChange={e => updateItem(i, 'amount', e.target.value)}
                          placeholder="0"
                          type="number"
                          min="0"
                          max="99999999"
                          className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 bg-gray-50 dark:bg-surface-800 text-gray-900 dark:text-white ${
                            itemErrors[i]
                              ? 'border-red-400 focus:ring-red-400/40'
                              : 'border-gray-200 dark:border-surface-700 focus:ring-primary-500/50'
                          }`}
                        />
                        {itemErrors[i] && (
                          <p className="text-[9px] text-red-500 mt-0.5 flex items-center gap-0.5">
                            <AlertCircle size={8} /> {itemErrors[i]}
                          </p>
                        )}
                      </td>
                      <td className="py-2">
                        {items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-surface-800 flex items-center justify-end gap-4">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Total Amount:</span>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white">₹{total.toLocaleString('en-IN')}/-</span>
            </div>
          </div>

          {/* ── PRINT PREVIEW ── */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 dark:border-surface-700 overflow-hidden">
            <div className="px-4 py-2 bg-gray-100 dark:bg-surface-800 border-b border-gray-200 dark:border-surface-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-mono">Invoice Preview</span>
            </div>

            <div ref={printRef} className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif', color: '#000', fontSize: '13px' }}>

              {/* Company Header */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 6px' }}>INVOICE</h1>
                <p style={{ fontWeight: 'bold', fontSize: '15px', margin: '2px 0' }}>{companyName}</p>
                <p style={{ margin: '2px 0' }}>{companyAddress}</p>
                <p style={{ margin: '2px 0' }}>Mobile No: {companyMobile}</p>
                <p style={{ margin: '2px 0' }}>GSTIN: {companyGstin}</p>
              </div>

              <hr style={{ borderColor: '#000', margin: '10px 0' }} />

              {/* Buyer & Invoice Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', margin: '10px 0' }}>
                <div><span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>BUYER'S DESCRIPTION:</span></div>
                <div style={{ textAlign: 'right' }}><span style={{ fontWeight: 'bold' }}>INVOICE NO:</span> {invoiceNo || '.......'}</div>

                <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: 'bold' }}>NAME:</span> {buyerName || '........'}</div>
                <div style={{ marginBottom: '8px' }}></div>

                <div><span style={{ fontWeight: 'bold' }}>DATE:</span>&nbsp;&nbsp;&nbsp;{date}</div>
                <div style={{ textAlign: 'right' }}><span style={{ fontWeight: 'bold' }}>STATE NAME:</span> {stateName}, <span style={{ fontWeight: 'bold' }}>CODE:</span> {stateCode}</div>

                <div><span style={{ fontWeight: 'bold' }}>MOBILE NO:</span> {buyerMobile || '....'}</div>
                <div style={{ textAlign: 'right' }}><span style={{ fontWeight: 'bold' }}>PLACE OF SUPPLY:</span> {placeOfSupply}</div>

                <div><span style={{ fontWeight: 'bold' }}>GSTIN/UIN:</span> {buyerGstin}</div>
                <div></div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center' }}>S.NO.</th>
                    <th style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'left' }}>DESCRIPTION OF GOODS</th>
                    <th style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center' }}>QTY.</th>
                    <th style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center' }}>RATE(Per pcs)</th>
                    <th style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center' }}>{i + 1}.</td>
                      <td style={{ border: '1px solid #000', padding: '5px 8px' }}>{item.desc || ' '}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center' }}>{item.qty ? `${item.qty} ${item.unit}` : ' '}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center' }}>{item.rate ? `${item.rate}/- per ${item.unit}` : ' '}</td>
                      <td style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center' }}>{item.amount ? `${item.amount}/-` : ' '}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount</td>
                    <td style={{ border: '1px solid #000', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>{total > 0 ? `${total.toLocaleString('en-IN')}/-` : ' '}</td>
                  </tr>
                </tbody>
              </table>

              {/* Note */}
              {noteText && <p style={{ margin: '8px 0' }}><strong>NOTE</strong>: {noteText}</p>}

              {/* Total in words */}
              {total > 0 && (
                <p style={{ margin: '8px 0' }}>
                  <strong style={{ textDecoration: 'underline' }}>TOTAL AMOUNT (IN WORDS):</strong>&nbsp;
                  {totalWords.toUpperCase()}
                </p>
              )}

              {/* Bank Details */}
              <div style={{ border: '1px solid #000', padding: '8px 12px', margin: '10px 0' }}>
                <p style={{ margin: '2px 0' }}><strong style={{ textDecoration: 'underline' }}>BANK DETAILS:</strong>&nbsp;{bankDetails}</p>
                <p style={{ margin: '2px 0' }}><strong>IFSC:</strong> {bankIfsc}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>A/C:</strong> {bankAcc}</p>
              </div>

              {/* Signature */}
              <div style={{ textAlign: 'right', marginTop: '32px' }}>
                <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>FOR: {companyName}</p>
                {sigUrl ? (
                  <img
                    src={sigUrl}
                    alt="Authorised Signature"
                    style={{ width: '160px', height: '70px', objectFit: 'contain', marginLeft: 'auto', marginTop: '8px', marginBottom: '8px', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '160px', height: '70px', border: '1px solid #aaa', borderRadius: '4px', marginLeft: 'auto', marginTop: '8px', marginBottom: '8px' }} />
                )}
                <p style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>AUTHORISED SIGN.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
