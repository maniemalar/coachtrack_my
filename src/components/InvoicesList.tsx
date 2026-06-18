import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, DollarSign, Check, ChevronRight, CornerDownRight, CreditCard } from 'lucide-react';
import { Payment, TraineeProfile, TrainerProfile } from '../types';
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

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16 pt-6 text-left">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            <span>My Invoices & Receipts</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Review your fitness class invoices, setup recurring athletic training budgets, and complete quick mockup card payments.
          </p>
        </div>

        {/* Summary badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm text-left relative overflow-hidden">
            <span className="absolute right-4 top-4 text-2xl text-emerald-300 opacity-60">✓</span>
            <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Total Paid Successfully</p>
            <p className="text-2xl font-black text-emerald-900 font-display mt-1">
              RM {payments.filter(p => p.status?.toLowerCase() === 'paid').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
              {payments.filter(p => p.status?.toLowerCase() === 'paid').length} transaction(s) cleared
            </p>
          </div>
          
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 shadow-sm text-left relative overflow-hidden">
            <span className="absolute right-4 top-4 text-2xl text-rose-300 opacity-60">⚠️</span>
            <p className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Overdue & Outstanding Balance</p>
            <p className="text-2xl font-black text-rose-900 font-display mt-1">
              RM {payments.filter(p => p.status?.toLowerCase() !== 'paid').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-rose-600 mt-1 font-semibold">
              {payments.filter(p => p.status?.toLowerCase() !== 'paid').length} payment(s) pending attention
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* List of Invoices Issued */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-display font-medium text-slate-900 text-base mb-4">
                Billing Account Transactions
              </h3>

              {payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No transactions registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div 
                      key={p.id} 
                      className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${
                        p.status === 'Paid' 
                          ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200' 
                          : 'bg-rose-50/20 border-rose-100 hover:border-rose-200'
                      }`}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {p.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">INV-{p.id.slice(0, 6)}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                          {p.itemDescription}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">Due Date: {p.dueDate}</p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                        <span className="text-lg font-black text-slate-950 font-display">
                          RM {p.amount.toFixed(2)}
                        </span>

                        <div className="flex flex-wrap gap-1.5 justify-end">
                          <button
                            id={`view-invoice-${p.id}`}
                            onClick={() => {
                              setSelectedInvoice(p);
                              setSelectedDocMode('invoice');
                            }}
                            className={`px-3 py-2 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition ${
                              selectedInvoice?.id === p.id && selectedDocMode === 'invoice'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-200/60 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Invoice PDF</span>
                          </button>

                          {p.status === 'Paid' && (
                            <button
                              id={`view-receipt-${p.id}`}
                              onClick={() => {
                                setSelectedInvoice(p);
                                setSelectedDocMode('receipt');
                              }}
                              className={`px-3 py-2 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition ${
                                selectedInvoice?.id === p.id && selectedDocMode === 'receipt'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Receipt PDF</span>
                            </button>
                          )}

                          {p.status !== 'Paid' && (
                            <button
                              id={`pay-trigger-${p.id}`}
                              onClick={() => {
                                setSelectedInvoice(p);
                                setSelectedDocMode('checkout');
                              }}
                              className={`px-3 py-2 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition ${
                                selectedInvoice?.id === p.id && selectedDocMode === 'checkout'
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-100'
                              }`}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Now</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Checkout or PDF render card */}
          <div>
            {selectedInvoice ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden text-left">
                
                {/* Visual Header Document Select Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-105 rounded-xl mb-6">
                  <button
                    onClick={() => setSelectedDocMode('invoice')}
                    className={`py-2 text-[11px] font-sans font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition ${
                      selectedDocMode === 'invoice'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Invoice PDF</span>
                  </button>

                  {selectedInvoice.status === 'Paid' ? (
                    <button
                      onClick={() => setSelectedDocMode('receipt')}
                      className={`py-2 text-[11px] font-sans font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition ${
                        selectedDocMode === 'receipt'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-emerald-705 hover:text-emerald-800'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Receipt PDF</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedDocMode('checkout')}
                      className={`py-2 text-[11px] font-sans font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition ${
                        selectedDocMode === 'checkout'
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-teal-705 hover:text-teal-800'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Checkout</span>
                    </button>
                  )}
                </div>

                {selectedDocMode === 'checkout' && selectedInvoice.status !== 'Paid' ? (
                  /* Pay Modal Mockup */
                  <div className="text-left">
                    <h4 className="font-display font-bold text-slate-900 text-lg mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-5 h-5 text-teal-600" />
                      <span>CoachTrack Malaysia Secure Pay</span>
                    </h4>
                    <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                      Complete mockup payment for invoice <strong className="text-indigo-950">INV-{selectedInvoice.id.slice(0, 6)}</strong>. Handled securely with client-token simulation.
                    </p>

                    {paymentSuccess ? (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-center my-6">
                        <span className="text-2xl block mb-1">🎉</span>
                        <p className="font-bold">Transaction Approved!</p>
                        <p className="text-xs">Your coach Coach Sarah Tan will receive the amount.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs">
                          <div className="flex justify-between items-center text-slate-500 mb-1">
                            <span>Item:</span>
                            <span className="font-bold text-slate-800 text-right max-w-[150px] truncate">{selectedInvoice.itemDescription}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-950 font-bold border-t border-slate-200 pt-1.5 mt-1.5">
                            <span>Total Due:</span>
                            <span className="text-sm">RM {selectedInvoice.amount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Card Mock fields */}
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                              Credit Card / Debit Number
                            </label>
                            <input 
                              type="text" 
                              value="4111 8888 2222 5555" 
                              disabled
                              title="Mock Card Number"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                                Expiry Date
                              </label>
                              <input 
                                type="text" 
                                value="12/28" 
                                disabled
                                title="Expiry Date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                                CVV Code
                              </label>
                              <input 
                                type="text" 
                                value="***" 
                                disabled
                                title="CVV Code"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handlePayMock(selectedInvoice.id)}
                          disabled={paymentLoading}
                          className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          {paymentLoading ? (
                            <span className="w-4 h-4 rounded-full border border-white border-t-transparent animate-spin"></span>
                          ) : (
                            <>
                              <span>Pay RM {selectedInvoice.amount.toFixed(2)} Now</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : selectedDocMode === 'receipt' && selectedInvoice.status === 'Paid' ? (
                  /* --------------------- OFFICIAL RECEIPTS VIEW --------------------- */
                  <div className="text-left text-xs bg-emerald-50/20 border border-emerald-300 p-4 rounded-xl border-dashed font-mono relative shadow-inner">
                    {/* Watermark paid */}
                    <div className="absolute right-4 top-14 opacity-20 pointer-events-none transform rotate-12 bg-emerald-100 border-2 border-dashed border-emerald-500 rounded-lg p-1.5 text-center text-emerald-800 font-bold tracking-widest text-xs z-0">
                      PAID ✓
                    </div>

                    <div className="flex justify-between items-start border-b border-dashed border-emerald-250 pb-3 mb-3 relative z-10">
                      <div>
                        <h5 className="font-bold text-emerald-800 uppercase text-[11px] font-sans">OFFICIAL RECEIPT</h5>
                        <p className="text-[9px] text-slate-400 uppercase font-sans">CoachTrack Platform</p>
                      </div>
                      <span className="text-[9px] bg-emerald-500 text-white font-bold px-1 rounded font-sans">
                        ACCEPTED
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500 mb-4 font-mono relative z-10 leading-normal">
                      <p><strong>Receipt No:</strong> REC-{selectedInvoice.id.slice(0, 8).toUpperCase()}</p>
                      <p><strong>Invoice Ref:</strong> INV-{selectedInvoice.id.slice(0, 8).toUpperCase()}</p>
                      <p><strong>Payment Date:</strong> {selectedInvoice.date || "11 Jun 2026"}</p>
                      <p><strong>Payment Method:</strong> Credit Card Simulation</p>
                      <p><strong>Transaction Ref:</strong> TX-{selectedInvoice.id.slice(2, 8).toUpperCase()}</p>
                    </div>

                    <div className="bg-white border border-slate-100 p-2.5 rounded-lg mb-3 text-[10px] relative z-10 font-sans">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Received From Trainee Client</p>
                      <p className="font-extrabold text-slate-800">{selectedInvoice.traineeName || 'Ahmad Bin Ibrahim'}</p>
                    </div>

                    <div className="border-t border-b border-dashed border-slate-200 py-3 mb-4 space-y-1.5 text-[10px]">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Description</span>
                        <span>Total (RM)</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="max-w-[150px] truncate">{selectedInvoice.itemDescription}</span>
                        <span>{selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1 mb-4 text-[10px]">
                      <p className="text-slate-500">Subtotal: RM {selectedInvoice.amount.toFixed(2)}</p>
                      <p className="font-black text-emerald-700 text-xs mt-1 border-t border-slate-200 pt-1">
                        Grand Paid Total: RM {selectedInvoice.amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-center font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 p-2 rounded text-[9px] relative z-10 font-sans">
                      ✓ E-Certified Payment Succeeded - SST Exempt
                    </div>

                    {/* Simulation print trigger */}
                    <button
                      onClick={() => alert('Direct Receipt PDF generated and mocked with browser print queue successfully!')}
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Download Receipt PDF</span>
                    </button>
                  </div>
                ) : (
                  /* printable TAX INVOICE render */
                  <div className="text-left text-xs bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 font-mono relative">
                    <div className="flex justify-between items-start border-b border-slate-250 pb-3 mb-3">
                      <div>
                        <h5 className="font-bold text-slate-800 uppercase text-xs">Tax Invoice</h5>
                        <p className="text-[10px] text-slate-400">Tax Invoice</p>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold p-1 rounded font-sans">
                        SST EXEMPT
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500 mb-4 leading-normal">
                      <p><strong>Invoice ID:</strong> INV-{selectedInvoice.id.slice(0, 8).toUpperCase()}</p>
                      <p><strong>Date Issued:</strong> 11 Jun 2026</p>
                      <p><strong>Trainer:</strong> Sarah Tan Fitness Services (SSM: 2026038923-M)</p>
                      <p><strong>Trainee Bill To:</strong> Ahmad Ibrahim</p>
                    </div>

                    <div className="border-t border-b border-slate-200 py-3 mb-4 space-y-1.5 text-[10px]">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Description</span>
                        <span>Total (RM)</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-mono">
                        <span className="max-w-[150px] truncate">{selectedInvoice.itemDescription}</span>
                        <span>{selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1 mb-4 text-[10px]">
                      <p className="text-slate-500">Subtotal: RM {selectedInvoice.amount.toFixed(2)}</p>
                      <p className="text-slate-500">Tax / SST (0%): RM 0.00</p>
                      <p className="font-black text-slate-800 text-xs mt-1 border-t border-slate-200 pt-1">
                        Grand Total Paid: RM {selectedInvoice.amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-center font-bold text-teal-700 bg-teal-50 border border-teal-100 p-2 rounded text-[10px] font-sans">
                      ✓ Paid via Credit Card Simulation
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 rounded-2xl p-6 border border-dashed border-slate-300 text-center py-16 text-slate-400 text-xs">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-500">No statement selected</p>
                <p className="mt-1">Tap Invoice PDF or Pay Now next to any transaction to print invoices or complete mockup payments.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
