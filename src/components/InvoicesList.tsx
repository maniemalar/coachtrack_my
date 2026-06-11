import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, DollarSign, Check, ChevronRight, CornerDownRight, CreditCard } from 'lucide-react';
import { Payment, TraineeProfile, TrainerProfile } from '../types';

interface InvoicesListProps {
  traineeId: string;
}

export default function InvoicesList({ traineeId }: InvoicesListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [traineeId]);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/payments?traineeId=${traineeId}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayMock = async (invoiceId: string) => {
    setPaymentLoading(true);
    setPaymentSuccess(false);

    try {
      const res = await fetch(`/api/payments/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
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

                        <div className="flex gap-1.5">
                          <button
                            id={`view-invoice-${p.id}`}
                            onClick={() => setSelectedInvoice(p)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-2 rounded-lg"
                          >
                            Invoice PDF
                          </button>
                          {p.status === 'Unpaid' && (
                            <button
                              id={`pay-trigger-${p.id}`}
                              onClick={() => setSelectedInvoice(p)}
                              className="bg-teal-650 text-white bg-teal-600 hover:bg-teal-700 text-[11px] font-bold px-3 py-2 rounded-lg"
                            >
                              Pay Now
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
              <div className="bg-white border border-slate-105 rounded-2xl p-6 shadow-md relative overflow-hidden">
                {selectedInvoice.status === 'Unpaid' ? (
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
                          className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
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
                ) : (
                  /* printable TAX INVOICE render */
                  <div className="text-left text-xs bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 font-mono relative">
                    <div className="flex justify-between items-start border-b border-slate-250 pb-3 mb-3">
                      <div>
                        <h5 className="font-bold text-slate-800 uppercase text-xs">Tax Invoice</h5>
                        <p className="text-[10px] text-slate-400">CoachTrack Partner</p>
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
                      <div className="flex justify-between text-slate-600">
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
