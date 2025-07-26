
export async function notifyN8N(workflowType, payload) {
  try {
    const res = await fetch(`https://n8n-16nx.onrender.com/webhook/${workflowType}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("n8n webhook failed:", res.statusText);
    } else {
      console.log("n8n notified successfully.");
    }
  } catch (error) {
    console.error("Error sending to n8n:", error.message);
  }
}
