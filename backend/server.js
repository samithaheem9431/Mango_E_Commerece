const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const mongoSanitize = require("mongo-sanitize");
const hpp = require("hpp");
const connectDB = require("./config/db");
const { ensureSuperAdmin } = require("./config/bootstrap");
const { apiLimiter, authLimiter, adminLimiter } = require("./middleware/security");

dotenv.config();
connectDB().then(() => ensureSuperAdmin());

const app = express();
app.disable("x-powered-by");

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    credentials: true
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(hpp());
app.use((req, _, next) => {
  if (req.body && typeof req.body === "object") req.body = mongoSanitize(req.body);
  if (req.query && typeof req.query === "object") req.query = mongoSanitize(req.query);
  next();
});
app.use(apiLimiter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_, res) => res.json({ message: "Mango API is running" }));
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", adminLimiter, require("./routes/adminRoutes"));

app.use((err, _, res, __) => {
  console.error(err.message);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
