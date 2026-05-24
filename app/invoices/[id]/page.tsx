"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Invoice, Client, Project, Signature } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";
import SignaturePad from "@/components/signature/SignaturePad";
import PaymentModal from "@/components/payments/PaymentModal";
import Link from "next/link";
import { useCompanySettings } from "@/lib/hooks/useCompanySettings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Trash2, Lock, Unlock, AlertCircle } from "lucide-react";

export default function InvoicePage() {
  const router = useRouter();
  const { id } = useParams();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [locking, setLocking] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  const { settings } = useCompanySettings();

  useEffect(() => {
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
  try {
    setLoading(true);
    
    // Load invoice
    const { data: inv, error: invError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (invError) {
      console.error("Invoice fetch error:", invError);
      throw invError;
    }
    setInvoice(inv);

    // Load payments
    const { data: pays, error: paysError } = await supabase
      .from("invoice_payments")
      .select("*")
      .eq("invoice_id", id)
      .order("created_at", { ascending: false });

    if (paysError) {
      console.error("Payments fetch error:", paysError);
      throw paysError;
    }
    setPayments(pays || []);
    
  } catch (err) {
    console.error("Error loading invoice:", err);
    alert("Error loading invoice data");
  } finally {
    setLoading(false);
  }
}

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingBalance = (invoice?.total || 0) - totalPaid;
  const isFullyPaid = remainingBalance === 0;
  
  // Manual lock status - based on database field
  const isLocked = invoice?.is_locked === true;
  const canLock = isFullyPaid && !isLocked;
  const canUnlock = isLocked;

  const isOverdue = invoice?.due_date &&
    !isFullyPaid &&
    remainingBalance > 0 &&
    new Date(invoice.due_date) < new Date();

  // Toggle manual lock
  const toggleLock = async () => {
    if (locking) return;
    
    setLocking(true);
    try {
      const newLockStatus = !isLocked;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = { 
        is_locked: newLockStatus
      };
      
      if (newLockStatus) {
        updateData.locked_at = new Date().toISOString();
        updateData.locked_by = user?.email || user?.id || 'unknown';
      } else {
        updateData.locked_at = null;
        updateData.locked_by = null;
      }
      
      const { error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
      
      await loadInvoice();
      alert(newLockStatus ? "✅ Invoice locked successfully" : "✅ Invoice unlocked successfully");
    } catch (err) {
      console.error("Error toggling lock:", err);
      alert("❌ Error updating lock status");
    } finally {
      setLocking(false);
    }
  };

const recordPayment = async (amount: number, method: string) => {
  console.log("=== RECORD PAYMENT START ===");
  console.log("Amount:", amount);
  console.log("Method:", method);
  console.log("Is locked:", isLocked);
  console.log("Invoice ID:", id);
  
  if (isLocked) {
    alert("❌ This invoice is locked. Cannot record payments.");
    return;
  }
  
  setSavingPayment(true);
  
  try {
    // Step 1: Insert payment
    console.log("Step 1: Inserting payment record...");
    const paymentData = {
      invoice_id: id,
      amount: amount,
      method: method,
      created_at: new Date().toISOString()
    };
    console.log("Payment data:", paymentData);
    
    const { data: paymentResult, error: paymentError } = await supabase
      .from("invoice_payments")
      .insert(paymentData)
      .select();
    
    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      throw new Error(`Payment insert failed: ${paymentError.message}`);
    }
    
    console.log("Payment inserted successfully:", paymentResult);
    
    // Step 2: Calculate new totals
    console.log("Step 2: Calculating new totals...");
    const newAmountPaid = totalPaid + amount;
    const newRemaining = (invoice?.total || 0) - newAmountPaid;
    const isNowFullyPaid = newRemaining === 0;
    
    console.log("New calculations:", {
      totalPaid,
      amount,
      newAmountPaid,
      invoiceTotal: invoice?.total,
      newRemaining,
      isNowFullyPaid
    });
    
    // Step 3: Update invoice
    console.log("Step 3: Updating invoice...");
    const updateData: any = {
      amount_paid: newAmountPaid,
      remaining_balance: newRemaining,
      status: isNowFullyPaid ? "paid" : "partial"
    };
    
    if (isNowFullyPaid) {
      updateData.paid_at = new Date().toISOString();
      console.log("Setting paid_at:", updateData.paid_at);
    }
    
    console.log("Update data:", updateData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .select();
    
    if (updateError) {
      console.error("Invoice update error:", updateError);
      throw new Error(`Invoice update failed: ${updateError.message}`);
    }
    
    console.log("Invoice updated successfully:", updateResult);
    
    // Step 4: Refresh data
    console.log("Step 4: Refreshing invoice data...");
    await loadInvoice();
    
    alert(`✅ Payment of ${formatCurrency(amount)} recorded!`);
    setShowPaymentModal(false);
    
  } catch (err) {
    console.error("=== ERROR RECORDING PAYMENT ===");
    console.error("Error object:", err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    alert(`❌ Error recording payment: ${err instanceof Error ? err.message : "Unknown error"}`);
  } finally {
    setSavingPayment(false);
    console.log("=== RECORD PAYMENT END ===");
  }
};


const deletePayment = async (paymentId: string) => {
  // Check lock status first
  if (isLocked) {
    alert("❌ This invoice is locked. Cannot delete payments.");
    return;
  }
  
  // Find the payment to delete
  const paymentToDelete = payments.find(p => p.id === paymentId);
  if (!paymentToDelete) {
    alert("Payment not found");
    return;
  }
  
  // Confirm deletion
  const confirmed = confirm(
    `Are you sure you want to delete the payment of ${formatCurrency(paymentToDelete.amount)}?\n\nThis action cannot be undone.`
  );
  
  if (!confirmed) return;
  
  setDeletingPaymentId(paymentId);
  
  try {
    // Delete the payment
    const { error: deleteError } = await supabase
      .from("invoice_payments")
      .delete()
      .eq("id", paymentId);
    
    if (deleteError) throw deleteError;
    
    // Get remaining payments
    const { data: remainingPayments, error: fetchError } = await supabase
      .from("invoice_payments")
      .select("*")
      .eq("invoice_id", id);
    
    if (fetchError) throw fetchError;
    
    // Calculate new totals
    const newTotalPaid = remainingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const newRemainingBalance = (invoice?.total || 0) - newTotalPaid;
    const newStatus = newRemainingBalance === 0 ? "paid" : newRemainingBalance === (invoice?.total || 0) ? "pending" : "partial";
    
    // Update invoice - REMOVED updated_at
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        amount_paid: newTotalPaid,
        remaining_balance: newRemainingBalance,
        status: newStatus,
        paid_at: newRemainingBalance === 0 ? new Date().toISOString() : null
        // removed: updated_at: new Date().toISOString()
      })
      .eq("id", id);
    
    if (updateError) throw updateError;
    
    // Update local state
    setPayments(remainingPayments);
    setInvoice({
      ...invoice!,
      amount_paid: newTotalPaid,
      remaining_balance: newRemainingBalance,
      status: newStatus,
      paid_at: newRemainingBalance === 0 ? new Date().toISOString() : null
    });
    
    alert("✅ Payment deleted successfully!");
    
  } catch (err) {
    console.error("Error deleting payment:", err);
    alert("❌ Error deleting payment");
  } finally {
    setDeletingPaymentId(null);
  }
};
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading invoice...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f6f7f9] pb-16">
        {/* Compact Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2">
          <div className="mx-auto max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                ←
              </button>
              <h1 className="text-sm font-semibold text-gray-900">
                Invoice #{invoice?.invoice_number || id?.slice(0, 8)}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/api/invoices/${id}/pdf`} target="_blank">
                <button className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
                  📄 PDF
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-3 p-3">
          {/* LOCK STATUS BANNER */}
          {isLocked && (
            <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-gray-600" />
                <span className="text-gray-600">🔒 Locked - No changes allowed</span>
                {invoice?.locked_by && (
                  <span className="text-gray-400 text-[10px]">
                    by {invoice.locked_by}
                  </span>
                )}
              </div>
              {canUnlock && (
                <button
                  onClick={toggleLock}
                  disabled={locking}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  <Unlock size={10} />
                  {locking ? "Processing..." : "Unlock"}
                </button>
              )}
            </div>
          )}

          {/* CAN LOCK BANNER - Show when fully paid but not locked */}
          {!isLocked && isFullyPaid && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={12} className="text-amber-600" />
                <span className="text-amber-700">
                  💰 This invoice is fully paid. You can lock it to prevent changes.
                </span>
              </div>
              <button
                onClick={toggleLock}
                disabled={locking}
                className="flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
              >
                <Lock size={10} />
                {locking ? "Processing..." : "Lock Invoice"}
              </button>
            </div>
          )}

          {/* Status Bar */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  isLocked ? "bg-gray-100 text-gray-600" :
                  isFullyPaid ? "bg-green-50 text-green-700" :
                  isOverdue ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {isLocked ? "Locked" : isFullyPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                </span>
                <div className="h-3 w-px bg-gray-200" />
                <div className="flex gap-2 text-[11px] text-gray-500">
                  <span>Due: {formatDate(invoice?.due_date)}</span>
                  {invoice?.paid_at && <span>Paid: {formatDate(invoice.paid_at)}</span>}
                </div>
              </div>
              <div className="text-xs font-semibold">
                Balance: {formatCurrency(remainingBalance)}
              </div>
            </div>
          </div>

          {/* Company + Client */}
          <div className="bg-white rounded-lg border border-gray-100 p-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] uppercase text-gray-400 mb-1">From</div>
                <div className="font-medium text-gray-900">{settings?.company_name || "N/A"}</div>
                <div className="text-gray-500 truncate">{settings?.company_address || "N/A"}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-gray-400 mb-1">Bill To</div>
                <div className="font-medium text-gray-900">{client?.name || "N/A"}</div>
                <div className="text-gray-500 truncate">{client?.email || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100">
                <h3 className="text-xs font-medium text-gray-700">{project.name}</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {project.line_items.map((item) => (
                  <div key={item.id} className="px-3 py-2 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-medium">{item.name}</div>
                      <div className="text-[10px] text-gray-400">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                    <div className="text-xs font-medium">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-100 p-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(invoice?.subtotal || 0)}</span>
              </div>
              {totalPaid > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <span>-{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="border-t pt-1.5 flex justify-between font-semibold">
                    <span>Balance Due</span>
                    <span>{formatCurrency(remainingBalance)}</span>
                  </div>
                </>
              )}
              {totalPaid === 0 && (
                <div className="border-t pt-1.5 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice?.total || 0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">Payments</span>
                <span className="text-[10px] text-gray-400">{payments.length} payment(s)</span>
              </div>
              <div className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <div key={payment.id} className="px-3 py-2 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-medium">{formatCurrency(payment.amount)}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{payment.method}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {!isLocked && (
                      <button
                        onClick={() => deletePayment(payment.id)}
                        disabled={deletingPaymentId === payment.id}
                        className="p-1 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                        title="Delete payment"
                      >
                        {deletingPaymentId === payment.id ? (
                          <span className="text-[10px]">...</span>
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pay Button - Only if not locked and not fully paid */}
          {!isLocked && remainingBalance > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              Pay {formatCurrency(remainingBalance)}
            </button>
          )}

          {/* Signature - Only if not locked */}
          {!isLocked && (
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-700">Signature</span>
              </div>
              <div className="p-2">
                <SignaturePad
                  onSave={() => {}}
                  existingSignature={invoice?.signature}
                  buttonText="Sign"
                />
              </div>
            </div>
          )}
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSave={recordPayment}
          remainingBalance={remainingBalance}
          saving={savingPayment}
        />
      </div>
    </ProtectedRoute>
  );
}