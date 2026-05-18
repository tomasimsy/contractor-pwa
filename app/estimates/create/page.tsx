"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { LineItem } from "@/types";
import Header from "@/components/ui/Header";
import ClientSelector from "@/components/forms/ClientSelector";
import LineItemsEditor from "@/components/forms/LineItemsEditor";
import {
  calculateSubtotal,
  calculateTax,
  calculateTotal,
} from "@/lib/utils/calculations";
import { formatCurrency } from "@/lib/utils/formatting";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { generateEstimateNumber } from "@/lib/utils/estimateNumber";

type Project = {
  id: string;
  name: string;
  description: string;
  items: LineItem[];
};

export default function CreateEstimate() {
  const router = useRouter();

  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  
  // Target total modal state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetTotal, setTargetTotal] = useState<number | null>(null);

  const createEmptyItem = (): LineItem => ({
    id: crypto.randomUUID(),
    category: "Material",
    name: "",
    description: "",
    quantity: 1,
    unit_price: 0,
    taxable: false,
    total: 0,
  });

  const createProject = (): Project => ({
    id: crypto.randomUUID(),
    name: "",
    description: "",
    items: [createEmptyItem()],
  });

  const [projects, setProjects] = useState<Project[]>([createProject()]);
  const [saving, setSaving] = useState(false);

  // ALL ITEMS FLATTENED
  const allItems = projects.flatMap((project) =>
    project.items.map((item) => ({
      ...item,
      project_name: project.name,
    }))
  );

  const subtotal = calculateSubtotal(allItems);
  const tax = calculateTax(subtotal, 0);
  const total = calculateTotal(subtotal, 0, 0, tax);

  // Distribute target total across all items
  const distributeToTargetTotal = () => {
    if (!targetTotal || targetTotal <= 0) {
      alert("Please enter a valid target total");
      return;
    }

    const currentTotal = subtotal;
    const difference = targetTotal - currentTotal;
    
    if (difference === 0) {
      alert("Target total is already equal to current total");
      return;
    }

    const allLineItems = projects.flatMap(p => p.items);
    
    if (allLineItems.length === 0) {
      alert("No items to distribute to");
      return;
    }

    const distributionPerItem = difference / allLineItems.length;
    
    const updatedProjects = projects.map(project => ({
      ...project,
      items: project.items.map(item => {
        const newUnitPrice = Math.max(0, item.unit_price + distributionPerItem);
        return {
          ...item,
          unit_price: newUnitPrice,
          total: item.quantity * newUnitPrice
        };
      })
    }));

    setProjects(updatedProjects);
    setTargetTotal(null);
    setShowTargetModal(false);
    alert(`Total updated to ${formatCurrency(targetTotal)}. Difference of ${formatCurrency(difference)} distributed across ${allLineItems.length} items.`);
  };

  const addProject = () => {
    setProjects((prev) => [...prev, createProject()]);
  };

  const removeProject = (projectId: string) => {
    if (projects.length === 1) return;
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  };

  const updateProject = (projectId: string, field: keyof Project, value: any) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, [field]: value } : project
      )
    );
  };

  const updateProjectItems = (projectId: string, updatedItems: LineItem[]) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, items: updatedItems } : project
      )
    );
  };

  const saveEstimate = async () => {
    if (!clientId) {
      return alert("Select a client");
    }

    if (projects.some((project) =>
      project.items.some((item) => !item.name.trim())
    )) {
      return alert("Name all line items");
    }

    const estimateNumber = await generateEstimateNumber();
    setSaving(true);

    const { data: estimate, error } = await supabase
      .from("estimates")
      .insert({
        client_id: clientId,
        estimate_number: estimateNumber,
        description: description || null,
        notes: notes || null,
        subtotal,
        total,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      alert("Error: " + error.message);
      setSaving(false);
      return;
    }

    const itemsToInsert = projects.flatMap((project) =>
      project.items.map((item) => ({
        estimate_id: estimate.id,
        project_name: project.name || null,
        project_description: project.description || null,
        category: item.category,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        taxable: item.taxable,
        total: item.quantity * item.unit_price,
      }))
    );

    const { error: itemsError } = await supabase
      .from("estimate_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error(itemsError);
      alert(itemsError.message);
    } else {
      alert(`Estimate #${estimateNumber} created successfully!`);
      router.push(`/estimates/${estimate.id}`);
    }

    setSaving(false);
  };

  return (
    <ProtectedRoute>
      {/* Target Total Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy mb-2">Set Target Total</h3>
            <p className="text-sm text-gray-500 mb-4">
              Current total: {formatCurrency(total)}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desired Total
              </label>
              <input
                type="number"
                value={targetTotal || ""}
                onChange={(e) => setTargetTotal(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="Enter total amount"
                step="0.01"
                autoFocus
              />
            </div>
            <div className="text-xs text-gray-400 mb-4">
              The difference will be distributed evenly across all {projects.flatMap(p => p.items).length} items.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTargetModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={distributeToTargetTotal}
                className="flex-1 py-2 bg-gold text-navy rounded-lg text-sm font-medium hover:bg-gold-dark"
              >
                Apply Target Total
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#f6f7f9] pb-10">
        {/* HEADER */}
        <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
          <Header
            title="New Estimate"
            backLink="/estimates"
            rightAction={
              <button
                onClick={saveEstimate}
                disabled={saving}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            }
          />
        </div>

        {/* CONTENT */}
        <div className="mx-auto max-w-3xl space-y-4 p-4">
          {/* CLIENT */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <ClientSelector selectedId={clientId} onSelect={setClientId} />
          </div>

          {/* DESCRIPTION */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Description
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-200 p-2 text-sm text-gray-700 focus:border-gray-300 focus:outline-none"
              rows={2}
              placeholder="Brief description of work..."
            />
          </div>

          {/* PROJECTS */}
          <div className="space-y-4">
            {projects.map((project, index) => {
              const projectSubtotal = calculateSubtotal(project.items);
              return (
                <div
                  key={project.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  {/* PROJECT HEADER */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Project {index + 1}
                    </div>
                    {projects.length > 1 && (
                      <button
                        onClick={() => removeProject(project.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* PROJECT NAME */}
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(project.id, "name", e.target.value)}
                    placeholder="Project name..."
                    className="mb-3 w-full rounded-lg border border-gray-200 p-2 text-sm text-gray-700 focus:border-gray-300 focus:outline-none"
                  />

                  {/* PROJECT DESCRIPTION */}
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, "description", e.target.value)}
                    rows={2}
                    placeholder="Project description..."
                    className="mb-4 w-full resize-none rounded-lg border border-gray-200 p-2 text-sm text-gray-700 focus:border-gray-300 focus:outline-none"
                  />

                  {/* PROJECT ITEMS */}
                  <LineItemsEditor
                    items={project.items}
                    onChange={(updatedItems) => updateProjectItems(project.id, updatedItems)}
                  />

                  {/* PROJECT TOTAL */}
                  <div className="mt-4 border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Project Total</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(projectSubtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ADD PROJECT */}
            <button
              onClick={addProject}
              className="w-full rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-sm font-medium text-gray-500 transition hover:border-gray-400 hover:text-gray-700"
            >
              + Add Project
            </button>
          </div>

          {/* SUMMARY */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Summary
              </div>
              <button
                onClick={() => setShowTargetModal(true)}
                className="text-xs text-gold hover:text-gold-dark transition"
              >
                🎯 Set Target Total
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-gray-800">
                <span className="font-medium">Total</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* NOTES */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Notes
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-200 p-2 text-xs text-gray-700 focus:border-gray-300 focus:outline-none"
              rows={2}
              placeholder="Additional notes for the client..."
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}