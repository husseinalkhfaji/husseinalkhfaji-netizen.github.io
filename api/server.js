const http = require("http");

const PORT = process.env.PORT || 10000;
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v25.0";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const RECIPIENT = (process.env.WHATSAPP_RECIPIENT || "9647723774412").replace(/\D/g, "");
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "ar";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "https://husseinalkhfaji.github.io")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function json(res, status, body, origin) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

function clean(v, max = 500) {
  return String(v || "").trim().slice(0, max);
}

function buildText(data) {
  return [
    "طلب تغطية جديد من الموقع",
    "",
    "الاسم: " + data.name,
    "رقم الهاتف: " + data.phone,
    "نوع الخدمة: " + data.service,
    "تاريخ الفعالية: " + (data.date || "غير محدد"),
    "التفاصيل: " + (data.details || "لا توجد تفاصيل إضافية")
  ].join("\n");
}

async function sendWhatsApp(data) {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    throw new Error("Missing WhatsApp API credentials");
  }

  const endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  let payload;
  if (TEMPLATE_NAME) {
    payload = {
      messaging_product: "whatsapp",
      to: RECIPIENT,
      type: "template",
      template: {
        name: TEMPLATE_NAME,
        language: { code: TEMPLATE_LANG },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: data.name },
              { type: "text", text: data.phone },
              { type: "text", text: data.service },
              { type: "text", text: data.date || "غير محدد" },
              { type: "text", text: data.details || "لا توجد تفاصيل إضافية" }
            ]
          }
        ]
      }
    };
  } else {
    payload = {
      messaging_product: "whatsapp",
      to: RECIPIENT,
      type: "text",
      text: { preview_url: false, body: buildText(data) }
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error("WhatsApp API request failed");
    err.meta = body;
    throw err;
  }
  return body;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";

  if (req.method === "OPTIONS") {
    return json(res, 204, {}, origin);
  }

  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, { ok: true }, origin);
  }

  if (req.method !== "POST" || req.url !== "/submit-booking") {
    return json(res, 404, { ok: false, error: "Not found" }, origin);
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json(res, 403, { ok: false, error: "Origin not allowed" }, origin);
  }

  let raw = "";
  req.on("data", chunk => {
    raw += chunk;
    if (raw.length > 20000) req.destroy();
  });

  req.on("end", async () => {
    try {
      const input = JSON.parse(raw || "{}");

      // Honeypot anti-spam field. Real users should leave this empty.
      if (input.website) {
        return json(res, 200, { ok: true }, origin);
      }

      const data = {
        name: clean(input.name, 120),
        phone: clean(input.phone, 80),
        service: clean(input.service, 120),
        date: clean(input.date, 40),
        details: clean(input.details, 900)
      };

      if (!data.name || !data.phone || !data.service) {
        return json(res, 400, { ok: false, error: "Missing required fields" }, origin);
      }

      const result = await sendWhatsApp(data);
      return json(res, 200, { ok: true, message_id: result.messages?.[0]?.id || null }, origin);
    } catch (e) {
      console.error(e.meta || e);
      return json(res, 500, { ok: false, error: "Could not send request" }, origin);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Booking API listening on ${PORT}`);
});
