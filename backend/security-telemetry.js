const crypto = require("crypto");
const net = require("net");
const { createClient } = require("@supabase/supabase-js");

const SITE = "micostskills.vercel.app";
const ACTIVE_TABLE = "micostskills_active_visitors";
const EVENTS_TABLE = "micostskills_security_events";
const ACTIVE_WINDOW_SECONDS = 75;
const EVENT_WINDOW_HOURS = 24;

function createSecurityTelemetry({ hashSecret }) {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const connectorToken = process.env.CYBERGUARD_CONNECTOR_TOKEN || "";
  const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

  function cleanIp(value) {
    let candidate = String(value || "").split(",")[0].trim();
    if (candidate.startsWith("::ffff:")) candidate = candidate.slice(7);
    if (candidate.startsWith("[") && candidate.includes("]")) candidate = candidate.slice(1, candidate.indexOf("]"));
    return net.isIP(candidate) ? candidate : "0.0.0.0";
  }

  function requestIp(req) {
    return cleanIp(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket?.remoteAddress);
  }

  function requestCountry(req) {
    const value = String(req.headers["x-vercel-ip-country"] || "").trim().toUpperCase();
    return /^[A-Z]{2}$/.test(value) ? value : null;
  }

  function safePath(value) {
    const raw = String(value || "/").split("?")[0].trim();
    if (!raw || raw.length > 300) return "/";
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  function sessionHash(sessionId, ip, userAgent) {
    return crypto
      .createHmac("sha256", String(hashSecret || "micostskills-security-telemetry"))
      .update(`${sessionId || "request"}|${ip}|${userAgent || "unknown"}`)
      .digest("hex");
  }

  function classify(pathName, method, userAgent) {
    const pathLower = pathName.toLowerCase();
    const uaLower = String(userAgent || "").toLowerCase();
    const reasons = [];
    let risk = "good";
    let signal = method === "POST" ? "Form or API request" : "Page view";

    const dangerousPaths = [
      "/.env", "/wp-login.php", "/xmlrpc.php", "/.git", "/server-status",
      "/phpmyadmin", "/vendor/phpunit", "/etc/passwd", "../", "%2e%2e"
    ];
    const reviewPaths = ["/admin", "/login", "/api/", "/graphql"];
    const scannerAgents = ["sqlmap", "nikto", "masscan", "nmap", "acunetix", "nessus", "zgrab", "gobuster", "dirbuster"];

    if (dangerousPaths.some((needle) => pathLower.includes(needle))) {
      risk = "dangerous";
      signal = "Sensitive path probe";
      reasons.push("request_path_matches_known_probe");
    } else if (scannerAgents.some((needle) => uaLower.includes(needle))) {
      risk = "dangerous";
      signal = "Scanner signature";
      reasons.push("scanner_user_agent");
    } else if (reviewPaths.some((needle) => pathLower.startsWith(needle)) || !["GET", "HEAD", "POST"].includes(method)) {
      risk = "review";
      signal = "Sensitive route access";
      reasons.push("sensitive_route_or_uncommon_method");
    }

    return { risk, signal, reasons };
  }

  function requestContext(req, sessionId) {
    const ip = requestIp(req);
    const userAgent = String(req.headers["user-agent"] || "").slice(0, 500) || null;
    const pathName = safePath(req.originalUrl || req.url);
    const method = String(req.method || "GET").toUpperCase();
    const classification = classify(pathName, method, userAgent);
    return {
      session_hash: sessionHash(sessionId, ip, userAgent),
      site: SITE,
      ip,
      country: requestCountry(req),
      path: pathName,
      user_agent: userAgent,
      signal: classification.signal,
      risk: classification.risk,
      risk_reasons: classification.reasons,
    };
  }

  async function upsertVisitor(context) {
    if (!supabase) return { recorded: false, reason: "supabase_not_configured" };
    const observedAt = new Date().toISOString();
    const { data: existing, error: readError } = await supabase
      .from(ACTIVE_TABLE)
      .select("session_hash,path,risk,request_count,first_seen")
      .eq("session_hash", context.session_hash)
      .maybeSingle();
    if (readError) throw readError;

    const eventType = !existing
      ? "enter"
      : existing.risk !== context.risk
        ? "risk_change"
        : existing.path !== context.path
          ? "route_change"
          : null;

    const { error: upsertError } = await supabase.from(ACTIVE_TABLE).upsert({
      ...context,
      request_count: Number(existing?.request_count || 0) + 1,
      first_seen: existing?.first_seen || observedAt,
      last_seen: observedAt,
    }, { onConflict: "session_hash" });
    if (upsertError) throw upsertError;

    if (eventType) {
      const { error: eventError } = await supabase.from(EVENTS_TABLE).insert({
        ...context,
        event_type: eventType,
        observed_at: observedAt,
      });
      if (eventError) throw eventError;
    }

    return { recorded: true, eventType };
  }

  async function recordHeartbeat(req, sessionId, pathName) {
    const context = requestContext(req, sessionId);
    context.path = safePath(pathName);
    const classification = classify(context.path, "GET", context.user_agent);
    context.signal = classification.signal;
    context.risk = classification.risk;
    context.risk_reasons = classification.reasons;
    return upsertVisitor(context);
  }

  async function recordAccess(req) {
    const cookie = String(req.headers.cookie || "");
    const cookieSession = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("micost_security_session="));
    const sessionId = cookieSession ? cookieSession.slice("micost_security_session=".length) : crypto.randomUUID();
    return { sessionId, ...(await upsertVisitor(requestContext(req, sessionId))) };
  }

  async function recordLeave(req, sessionId) {
    if (!supabase) return { recorded: false, reason: "supabase_not_configured" };
    const context = requestContext(req, sessionId);
    const { data: existing, error: readError } = await supabase
      .from(ACTIVE_TABLE)
      .select("*")
      .eq("session_hash", context.session_hash)
      .maybeSingle();
    if (readError) throw readError;
    if (!existing) return { recorded: false, reason: "visitor_not_found" };

    const observedAt = new Date().toISOString();
    const { error: eventError } = await supabase.from(EVENTS_TABLE).insert({
      site: existing.site,
      session_hash: existing.session_hash,
      event_type: "leave",
      ip: existing.ip,
      country: existing.country,
      path: existing.path,
      user_agent: existing.user_agent,
      signal: "Visitor left",
      risk: existing.risk,
      risk_reasons: existing.risk_reasons,
      observed_at: observedAt,
    });
    if (eventError) throw eventError;
    const { error: deleteError } = await supabase.from(ACTIVE_TABLE).delete().eq("session_hash", existing.session_hash);
    if (deleteError) throw deleteError;
    return { recorded: true };
  }

  function authorize(req) {
    if (!connectorToken) return false;
    const provided = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const expectedBuffer = Buffer.from(connectorToken);
    const providedBuffer = Buffer.from(provided);
    return expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  }

  async function getTrafficFeed() {
    if (!supabase) throw new Error("Supabase telemetry is not configured.");
    const activeCutoff = new Date(Date.now() - ACTIVE_WINDOW_SECONDS * 1000).toISOString();
    const eventCutoff = new Date(Date.now() - EVENT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

    await supabase.from(ACTIVE_TABLE).delete().lt("last_seen", activeCutoff);
    const [{ data: active, error: activeError }, { data: events, error: eventsError }] = await Promise.all([
      supabase.from(ACTIVE_TABLE).select("session_hash,ip,country,path,signal,risk,risk_reasons,request_count,first_seen,last_seen").gte("last_seen", activeCutoff).order("last_seen", { ascending: false }).limit(100),
      supabase.from(EVENTS_TABLE).select("id,event_type,ip,country,path,signal,risk,risk_reasons,observed_at").gte("observed_at", eventCutoff).order("observed_at", { ascending: false }).limit(100),
    ]);
    if (activeError) throw activeError;
    if (eventsError) throw eventsError;

    return {
      connected: true,
      source: SITE,
      generatedAt: new Date().toISOString(),
      activeWindowSeconds: ACTIVE_WINDOW_SECONDS,
      activeVisitors: active || [],
      recentEvents: events || [],
    };
  }

  return {
    authorize,
    getTrafficFeed,
    recordAccess,
    recordHeartbeat,
    recordLeave,
    status: () => ({ configured: Boolean(supabase), protectedFeed: Boolean(connectorToken), source: SITE }),
  };
}

module.exports = { createSecurityTelemetry };
