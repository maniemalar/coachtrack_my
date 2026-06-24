import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Check, 
  CreditCard, 
  X,
  Plus, 
  Clock, 
  TrendingUp, 
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { Payment } from '../types';
import { dbService } from '../lib/dbService';

interface InvoicesListProps {
  traineeId: string;
}

export default function InvoicesList({ traineeId }: InvoicesListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [selectedDocMode, setSelectedDocMode] = useState<'invoice' | 'receipt' | 'checkout'>('invoice');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'invoices' | 'history'>('invoices');

  useEffect(() => {
    fetchPayments();
  }, [traineeId]);

  const fetchPayments = async () => {
    try {
      const data = await dbService.getPayments({ traineeId });
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayMock = async (invoiceId: string) => {
    setPaymentLoading(true);
    setPaymentSuccess(false);

    try {
      const ok = await dbService.payInvoice(invoiceId);

      if (ok) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          setSelectedInvoice(null);
          fetchPayments();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const totalPaid = payments
    .filter(p => p.status?.toLowerCase() === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUnpaid = payments
    .filter(p => p.status?.toLowerCase() !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const displayedPayments = payments.filter(p => {
    const isPaid = p.status?.toLowerCase() === 'paid';
    return activeSegment === 'invoices' ? !isPaid : isPaid;
  });

  return (
    <div className="max-w-md mx-auto px-4 py-6 text-left space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-[10px] font-bold tracking-wider uppercase bg-[#081F63] text-[#18D4C5] px-3 py-1 rounded-full mb-2 inline-block">
          Financial Cabinet
        </span>
        <h2 className="text-2xl font-black font-display text-slate-900">Bills & Payments</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review pending invoices, complete quick card simulations, and inspect official PDF receipts.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-4 text-left relative overflow-hidden">
          <p className="text-[9px] uppercase font-black text-emerald-800 tracking-wider">Total Cleared</p>
          <p className="text-lg font-black text-emerald-950 font-sans mt-0.5">
            RM {totalPaid.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-650 font-semibold block mt-1">
            {payments.filter(p => p.status?.toLowerCase() === 'paid').length} Transactions
          </span>
        </div>
        
        <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-4 text-left relative overflow-hidden">
          <p className="text-[9px] uppercase font-black text-rose-800 tracking-wider">Outstanding Balance</p>
          <p className="text-lg font-black text-rose-950 font-sans mt-0.5">
            RM {totalUnpaid.toFixed(2)}
          </p>
          <span className="text-[10px] text-rose-650 font-semibold block mt-1">
            {payments.filter(p => p.status?.toLowerCase() !== 'paid').length} Pending Bills
          </span>
        </div>
      </div>

      {/* Segment Selector Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setActiveSegment('invoices')}
          className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
            activeSegment === 'invoices' 
              ? 'bg-[#081F63] text-white shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Recent Invoices
        </button>
        <button
          onClick={() => setActiveSegment('history')}
          className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
            activeSegment === 'history' 
              ? 'bg-[#081F63] text-white shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Payment History
        </button>
      </div>

      {/* List of Payments */}
      <div className="space-y-4">
        <h3 className="font-display font-black text-xs text-slate-400 uppercase tracking-wider pl-1">
          {activeSegment === 'invoices' ? 'Outstanding Pending' : 'Cleared Receipts Log'}
        </h3>

        {displayedPayments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-6">
            <CheckCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              {activeSegment === 'invoices' ? 'All outstanding bills cleared!' : 'No payment history found.'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {activeSegment === 'invoices' 
                ? 'Your Coach Sarah subscriptions are up to date.' 
                : 'Any finalized invoice transactions will be securely logged here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedPayments.map((p) => {
              const isPaid = p.status?.toLowerCase() === 'paid';
              return (
                <div 
                  key={p.id} 
                  className={`border rounded-xl p-3.5 transition relative overflow-hidden bg-white shadow-xs ${
                    isPaid ? 'border-slate-100 hover:border-emerald-200' : 'border-rose-100 hover:border-rose-200'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      isPaid 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                        : 'bg-rose-50 text-rose-700 border-rose-150'
                    }`}>
                      {p.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">INV-{p.id.slice(0, 5).toUpperCase()}</span>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-[12.5px] leading-tight mb-1 font-sans break-words max-w-full">
                    {p.itemDescription}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">Due Date: {p.dueDate}</p>

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 mt-2.5">
                    <span className="text-[13.5px] font-black text-slate-900 font-mono">
                      RM {p.amount.toFixed(2)}
                    </span>

                    <div className="flex gap-1.5">
                      {isPaid ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(p);
                            setSelectedDocMode('receipt');
                          }}
                          className="h-7 px-2.5 text-[10.5px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center gap-1 cursor-pointer transition border border-emerald-100"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Receipt</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedInvoice(p);
                            setSelectedDocMode('checkout');
                          }}
                          className="h-7 px-2.5 text-[10.5px] font-bold rounded-lg bg-[#081F63] hover:bg-[#07194f] text-white flex items-center gap-1 cursor-pointer transition"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Pay Now</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedInvoice(p);
                          setSelectedDocMode('invoice');
                        }}
                        className="h-7 px-2.5 text-[10.5px] font-bold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer transition border border-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Slide-Up Modal Platform Sheet */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[1050] flex items-end sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 pb-6 relative shadow-2xl overflow-hidden animate-slide-up sm:animate-zoom-in space-y-4 mb-[68px] sm:mb-0 max-h-[calc(100vh-84px)] sm:max-h-[90vh] overflow-y-auto">
            
            {/* Close */}
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold p-1 bg-slate-50 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Selector Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 rounded-xl">
              <button
                onClick={() => setSelectedDocMode('invoice')}
                className={`py-1.5 text-[10px] font-bold rounded-lg transition ${
                  selectedDocMode === 'invoice' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Tax Invoice
              </button>
              {selectedInvoice.status?.toLowerCase() === 'paid' ? (
                <button
                  onClick={() => setSelectedDocMode('receipt')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition ${
                    selectedDocMode === 'receipt' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Official Receipt
                </button>
              ) : (
                <button
                  onClick={() => setSelectedDocMode('checkout')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition ${
                    selectedDocMode === 'checkout' ? 'bg-teal-650 bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Pay Balance
                </button>
              )}
            </div>

            {/* Doc Mode: Checkout Pay */}
            {selectedDocMode === 'checkout' && selectedInvoice.status?.toLowerCase() !== 'paid' && (
              <div className="space-y-4">
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-1">
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    <span>Secure Gateway Pay</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Complete quick billing clearance for invoice #INV-{selectedInvoice.id.slice(0, 5).toUpperCase()}.
                  </p>
                </div>

                {paymentSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-center my-4">
                    <p className="text-sm font-black">🎉 Transaction Approved!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Cleared. Thank you for your support!</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Description:</span>
                        <span className="font-bold text-slate-800 text-right max-w-[150px] truncate">{selectedInvoice.itemDescription}</span>
                      </div>
                      <div className="flex justify-between items-center font-black text-slate-950 border-t border-slate-200/50 pt-1.5 mt-1.5">
                        <span>Total Due:</span>
                        <span className="text-sm text-teal-650 text-teal-600">RM {selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                          Credit Card / Debit Number
                        </label>
                        <input 
                          type="text" 
                          value="4111 8888 2222 5555" 
                          disabled
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-500 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                            Expiry
                          </label>
                          <input 
                            type="text" 
                            value="12/28" 
                            disabled
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                            CVV
                          </label>
                          <input 
                            type="text" 
                            value="***" 
                            disabled
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePayMock(selectedInvoice.id)}
                      disabled={paymentLoading}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                    >
                      {paymentLoading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      ) : (
                        `Pay RM ${selectedInvoice.amount.toFixed(2)} Now`
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Doc Mode: Official Receipt */}
            {selectedDocMode === 'receipt' && selectedInvoice.status?.toLowerCase() === 'paid' && (
              <div className="text-left text-xs bg-emerald-50/20 border border-emerald-250 p-4 rounded-2xl border-dashed font-mono relative space-y-3.5">
                <div className="absolute right-4 top-14 opacity-25 transform rotate-12 bg-emerald-105 border border-emerald-400 rounded p-1 text-emerald-800 font-extrabold tracking-widest text-[10px]">
                  PAID ✓
                </div>

                <div className="flex justify-between items-start border-b border-dashed border-emerald-200 pb-2.5">
                  <div>
                    <h5 className="font-extrabold text-emerald-800 text-[11px] font-sans">OFFICIAL RECEIPT</h5>
                    <p className="text-[9px] text-slate-400 font-sans">CoachTrack Platform</p>
                  </div>
                </div>

                <div className="space-y-0.5 text-[9px] text-slate-500 leading-tight">
                  <p><strong>Receipt No:</strong> REC-{selectedInvoice.id.slice(0, 6).toUpperCase()}</p>
                  <p><strong>Invoice Ref:</strong> INV-{selectedInvoice.id.slice(0, 6).toUpperCase()}</p>
                  <p><strong>Date:</strong> {selectedInvoice.date || "Today"}</p>
                  <p><strong>Method:</strong> Credit Card Online</p>
                </div>

                <div className="bg-white border border-slate-100 p-2 rounded text-[9px] font-sans">
                  <p className="text-slate-400 font-bold uppercase tracking-wide text-[8px]">Received From</p>
                  <p className="font-black text-slate-800">{selectedInvoice.traineeName || 'Ahmad Bin Ibrahim'}</p>
                </div>

                <div className="border-t border-b border-dashed border-slate-200 py-2 text-[9px] leading-relaxed">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>Description</span>
                    <span>Total (RM)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span className="truncate max-w-[140px]">{selectedInvoice.itemDescription}</span>
                    <span>{selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-emerald-800 text-xs text-emerald-700">
                    Grand Paid Total: RM {selectedInvoice.amount.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => alert(`Direct receipt file REC-${selectedInvoice.id.toUpperCase()}.pdf triggered for download.`)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Download receipt PDF</span>
                </button>
              </div>
            )}

            {/* Doc Mode: Printable Tax Invoice */}
            {selectedDocMode === 'invoice' && (
              <div className="text-left text-xs bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 font-mono relative space-y-3">
                <div className="flex justify-between items-start border-b border-slate-200 pb-2 mb-1">
                  <div>
                    <h5 className="font-black text-slate-800 text-[11px] font-sans">TAX INVOICE</h5>
                    <p className="text-[9px] text-slate-400 font-sans">Invoice Statement</p>
                  </div>
                  <span className={`text-[8px] font-extrabold px-1.5 rounded font-sans uppercase ${
                    selectedInvoice.status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>

                <div className="space-y-0.5 text-[9px] text-slate-500 leading-snug">
                  <p><strong>Invoice ID:</strong> INV-{selectedInvoice.id.slice(0, 6).toUpperCase()}</p>
                  <p><strong>Issued:</strong> {selectedInvoice.date || "Today"}</p>
                  <p><strong>Coach Provider:</strong> Sarah Tan Premium Services</p>
                  <p><strong>Trainee Bill To:</strong> {selectedInvoice.traineeName || 'Ahmad Bin Ibrahim'}</p>
                </div>

                <div className="border-t border-b border-slate-200/60 py-2.5 text-[9px]">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>Description</span>
                    <span>Total (RM)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span className="truncate max-w-[140px]">{selectedInvoice.itemDescription}</span>
                    <span>{selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-right text-[10px] space-y-0.5">
                  <p className="text-slate-500">Subtotal: RM {selectedInvoice.amount.toFixed(2)}</p>
                  <p className="text-slate-500">Tax / SST (0%): RM 0.00</p>
                  <p className="font-bold text-slate-850 text-slate-900 border-t border-slate-200 pt-1.5 mt-1">
                    Grand Total: RM {selectedInvoice.amount.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => alert(`Direct invoice statement INV-${selectedInvoice.id.toUpperCase()}.pdf triggered for download.`)}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-sans font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download invoice PDF</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
