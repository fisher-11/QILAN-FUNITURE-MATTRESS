const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// protect private server files

app.use((req, res, next) => {
    const blocked = [
        "/server.js",
        "/package.json",
        "/package-lock.json",
        "/qilan.db"
    ];


  if  (blocked.includes(req.path))  {
    return res.sendStatus(404)
  }

  next()

});

app.use(express.static(__dirname));

const db = new sqlite3.Database("./qilan.db");

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price INTEGER NOT NULL,
            width INTEGER,
            length INTEGER,
            height INTEGER,
            image TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            product_name TEXT,
            width INTEGER,
            length INTEGER,
            height INTEGER,
            color TEXT,
            quantity INTEGER,
            customer_name TEXT,
            phone TEXT,
            district TEXT,
            sector TEXT,
            cell TEXT,
            village TEXT,
            payment TEXT,
            total INTEGER,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.get(
        "SELECT COUNT(*) AS count FROM products",
        (err, row) => {

            if (err) {
                console.error(err);
                return;
            }

            if (row.count === 0) {

                const products = [

                    [
                        "Luxury Bed",
                        "Beds",
                        450000,
                        180,
                        200,
                        120,
                        "images/bed.jpg",
                        "Modern luxury bed"
                    ],

                    [
                        "Modern Sofa",
                        "Sofas",
                        620000,
                        280,
                        180,
                        90,
                        "images/sofa.jpg",
                        "Comfortable modern sofa"
                    ],

                    [
                        "4 Door Wardrobe",
                        "Wardrobes",
                        480000,
                        180,
                        60,
                        220,
                        "images/wardrobe.jpg",
                        "Large modern wardrobe"
                    ],

                    [
                        "Dining Table Set",
                        "Dining",
                        380000,
                        160,
                        90,
                        75,
                        "images/dining.jpg",
                        "Modern dining table set"
                    ],

                    [
                        "TV Stand",
                        "TV Stands",
                        250000,
                        200,
                        45,
                        60,
                        "images/tv-stand.jpg",
                        "Modern TV stand"
                    ],

                    [
                        "Coffee Table",
                        "Coffee Tables",
                        180000,
                        120,
                        60,
                        45,
                        "images/coffee-table.jpg",
                        "Elegant coffee table"
                    ],

                    [
                        "Spring Mattress",
                        "Mattresses",
                        320000,
                        140,
                        190,
                        25,
                        "images/mattress.jpg",
                        "Premium spring mattress"
                    ]

                ];

                const stmt = db.prepare(`
                    INSERT INTO products
                    (name, category, price, width, length, height, image, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                products.forEach(product => {
                    stmt.run(product);
                });

                stmt.finalize();

                console.log("Default products inserted.");
            }
        }
    );

});


/* ================= PRODUCTS ================= */

app.get("/api/products", (req, res) => {

    db.all(
        "SELECT * FROM products ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );

});


app.get("/api/products/:id", (req, res) => {

    db.get(
        "SELECT * FROM products WHERE id = ?",
        [req.params.id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    error: "Product not found"
                });
            }

            res.json(row);
        }
    );

});


/* ================= ADD PRODUCT ================= */

app.post("/api/products", (req, res) => {

    const {
        name,
        category,
        price,
        width,
        length,
        height,
        image,
        description
    } = req.body;

    if (!name || !category || !price) {

        return res.status(400).json({
            error: "Name, category and price are required."
        });

    }

    db.run(
        `
        INSERT INTO products
        (name, category, price, width, length, height, image, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            name,
            category,
            price,
            width,
            length,
            height,
            image,
            description
        ],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});


/* ================= UPDATE PRODUCT ================= */

app.put("/api/products/:id", (req, res) => {

    const {
        name,
        category,
        price,
        width,
        length,
        height,
        image,
        description
    } = req.body;

    db.run(
        `
        UPDATE products
        SET
        name = ?,
        category = ?,
        price = ?,
        width = ?,
        length = ?,
        height = ?,
        image = ?,
        description = ?
        WHERE id = ?
        `,
        [
            name,
            category,
            price,
            width,
            length,
            height,
            image,
            description,
            req.params.id
        ],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                success: true
            });

        }
    );

});


/* ================= DELETE PRODUCT ================= */

app.delete("/api/products/:id", (req, res) => {

    db.run(
        "DELETE FROM products WHERE id = ?",
        [req.params.id],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                success: true
            });

        }
    );

});


/* ================= ORDERS ================= */

app.get("/api/orders", (req, res) => {

    db.all(
        "SELECT * FROM orders ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(rows);
        }
    );

});


app.post("/api/orders", (req, res) => {

    const {
        product_id,
        product_name,
        width,
        length,
        height,
        color,
        quantity,
        customer_name,
        phone,
        district,
        sector,
        cell,
        village,
        payment,
        total
    } = req.body;

    db.run(
        `
        INSERT INTO orders
        (
            product_id,
            product_name,
            width,
            length,
            height,
            color,
            quantity,
            customer_name,
            phone,
            district,
            sector,
            cell,
            village,
            payment,
            total
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            product_id,
            product_name,
            width,
            length,
            height,
            color,
            quantity,
            customer_name,
            phone,
            district,
            sector,
            cell,
            village,
            payment,
            total
        ],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                success: true,
                orderId: this.lastID
            });

        }
    );

});


/* ================= UPDATE ORDER STATUS ================= */

app.put("/api/orders/:id", (req, res) => {

    const { status } = req.body;

    db.run(
        `
        UPDATE orders
        SET status = ?
        WHERE id = ?
        `,
        [status, req.params.id],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                success: true
            });

        }
    );

});


app.delete("/api/orders/:id", (req, res) => {

    db.run(
        "DELETE FROM orders WHERE id = ?",
        [req.params.id],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                success: true
            });

        }
    );

});


/* ================= ADMIN LOGIN ================= */

app.post("/api/admin/login", (req, res) => {

    const { username, password } = req.body;

    if (
        username === "admin" &&
        password === "Qilan2026"
    ) {

        return res.json({
            success: true
        });

    }

    res.status(401).json({
        success: false,
        error: "Invalid username or password"
    });

});


/* ================= SERVER ================= */

app.listen(PORT, () => {

    console.log("");
    console.log("==================================");
    console.log(" QILAN FURNITURE SERVER");
    console.log("==================================");
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`Admin:   http://localhost:${PORT}/admin.html`);
    console.log("==================================");
    console.log("");

});

