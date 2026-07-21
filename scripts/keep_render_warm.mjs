const targetUrl = String(process.env.SYNAPSE_KEEP_WARM_URL || "").trim();

async function keepWarm() {
  if (!targetUrl) throw new Error("SYNAPSE_KEEP_WARM_URL is required.");
  const url = new URL(targetUrl);
  if (url.protocol !== "https:") throw new Error("SYNAPSE_KEEP_WARM_URL must use HTTPS.");

  const response = await fetch(url, {
    method: "GET",
    headers: { "User-Agent": "synapse-render-keep-warm/1.0" },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) {
    throw new Error(`Keep-warm health check returned HTTP ${response.status}.`);
  }
  console.log(`Synapse analysis service is warm (HTTP ${response.status}).`);
}

keepWarm().catch(error => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
