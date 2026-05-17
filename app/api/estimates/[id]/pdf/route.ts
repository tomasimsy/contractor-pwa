import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: estimate } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", id)
      .single();

    if (!estimate) {
      return new NextResponse("Not found", { status: 404 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", estimate.client_id)
      .single();

    const { data: items } = await supabase
      .from("estimate_items")
      .select("*")
      .eq("estimate_id", id);

    // Generate HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Estimate ${estimate.estimate_number || estimate.id.slice(0, 8)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #d4a048;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #0b1630;
          }
          .company-details {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .document-title {
            font-size: 20px;
            font-weight: bold;
            color: #d4a048;
            margin: 20px 0;
          }
          .client-section {
            background: #f5f5f5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #0b1630;
            color: white;
            padding: 10px;
            text-align: left;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #d4a048;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: #999;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">One Square Roof LLC</div>
          <div class="company-details">Charlotte, North Carolina</div>
          <div class="company-details">Phone: (704) 303-4112</div>
          <div class="company-details">Email: onesquareroof@gmail.com</div>
        </div>

        <div class="document-title">ESTIMATE</div>
        <div>#${estimate.estimate_number || estimate.id.slice(0, 8)}</div>
        <div>Date: ${new Date(estimate.created_at).toLocaleDateString()}</div>

        <div class="client-section">
          <strong>Customer Information</strong><br/>
          ${client?.name || "No client"}<br/>
          ${client?.phone ? `Phone: ${client.phone}<br/>` : ""}
          ${client?.email ? `Email: ${client.email}<br/>` : ""}
          ${client?.address ? `Address: ${client.address}<br/>` : ""}
        </div>

        ${estimate.description ? `
          <div>
            <strong>Description</strong><br/>
            ${estimate.description}
          </div>
        ` : ""}

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items?.map(item => `
              <tr>
                <td>${item.name || "-"}</td>
                <td>${item.description || "-"}</td>
                <td>${item.quantity || 0}</td>
                <td>$${(item.unit_price || 0).toFixed(2)}</td>
                <td>$${(item.total || 0).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="total">
          Total: $${items?.reduce((sum, i) => sum + (i.total || 0), 0).toFixed(2) || "0.00"}
        </div>

        ${estimate.signature ? `
          <div style="margin-top: 40px;">
            <strong>Customer Signature</strong><br/>
            Signed on: ${new Date(estimate.signature.date).toLocaleDateString()}
          </div>
        ` : ""}

        <div class="footer">
          Thank you for choosing One Square Roof LLC
        </div>
      </body>
      </html>
    `;

    // Return HTML that can be printed to PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("PDF error:", error);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}