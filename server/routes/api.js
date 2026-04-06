const express = require("express");
const router = express.Router();
const { sql, getConnection } = require("../db");
const { NVarChar } = require("mssql");
const ExcelJS = require("exceljs");
const multer = require("multer");

// ✅ Multer setup for memory storage (we'll store image as binary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // console.log(req.body);

        const pool = await getConnection();

        const result = await pool.request()
            .input("username", sql.VarChar, username)
            .input("password", sql.VarChar, password)
            .query(`
                SELECT id, empName, empid, empBranch,empBranchID,type , role
                FROM users
                WHERE empid = @username AND Password = @password AND type = 'stud'
            `);

            // console.log(result);

        if (result.recordset.length > 0) {
            return res.json({
                status: "success",
                data: result.recordset[0]
            });
        } else {
            return res.status(401).json({
                status: "fail",
                message: "Invalid username or password"
            });
        }

    } catch (error) {
        console.log("LOGIN ERROR:", error);
        return res.status(500).json({
            status: "error",
            message: "Server issue"
        });
    }
});

///       getToken

router.get("/getToken", async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .query(`SELECT TOP 1 TransferID FROM studioInventory ORDER BY id DESC`);

    if (result.recordset.length > 0) {
      const lastToken = result.recordset[0].TransferID; // ✅ Access via recordset
      const num = parseInt(lastToken.replace("TR", "")) + 1;
      res.json({ token: "TR" + num });
    } else {
      res.json({ token: "TR1" });
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching last token entry");
  }
});

// get products 
router.get("/getProducts", async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .query(`SELECT counter FROM productMaster ORDER BY productid ASC`);

    if (result.recordset.length > 0) {
      res.json(result.recordset); // [{ ProductName: 'Gold' }, { ProductName: 'Silver' }]
    } else {
      res.json([]); // empty array if no products
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching products");
  }
});

// new product

// POST /addProduct
// router.post("/addProduct", async (req, res) => {
//   const { name } = req.body;
//   if (!name) return res.status(400).json({ message: "Name is required" });

//   try {
//     const pool = await getConnection();
//     await pool
//       .request()
//       .input("name", name.toUpperCase())
//       .query(`INSERT INTO productMaster (counter) VALUES (@name)`);

//     res.json({ message: "Product added successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.post("/addProduct", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const pool = await getConnection();

    const productName = name.toUpperCase();

    // 🔍 Check if already exists
    const check = await pool
      .request()
      .input("name", productName)
      .query(`SELECT COUNT(*) as count FROM productMaster WHERE counter = @name`);

    if (check.recordset[0].count > 0) {
      return res.status(400).json({ message: "Product already exists" });
    }

    // ✅ Insert if not exists
    await pool
      .request()
      .input("name", productName)
      .query(`INSERT INTO productMaster (counter) VALUES (@name)`);

    res.json({ message: "Product added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Entry Save

router.post("/saveEntry", upload.single("image"), async (req, res) => {
  try {
    const { token, product, weight, date, remark, user } = req.body;
    const image = req.file;

    if (!token || !product || !weight || !date || !image || !user) {
      return res.status(400).json({ message: "All fields including image are required" });
    }

    // ✅ Get MSSQL pool
    const pool = await getConnection();

    // Insert into studioInventory
    await pool.request()
      .input("TransferID", sql.NVarChar, token)
      .input("Product", sql.NVarChar, product)
      .input("IssuedWeight", sql.Decimal(18, 2), weight)
      .input("Remark", sql.NVarChar, remark || "")
      .input("creator", sql.NVarChar, user || "-")
      .input("Image", sql.VarBinary(sql.MAX), image.buffer)
      .query(`
        INSERT INTO studioInventory
        (TransferID, ProductName, IssuedWt, CreatedDate, createdBy, remarks, ProductImage, status)
        VALUES (@TransferID, @Product, @IssuedWeight, GETDATE(), @creator, @Remark, @Image, '0')
      `);

    res.status(200).json({ message: "Product Entry Saved Successfully" });

  } catch (err) {
    console.error("SAVE ENTRY ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// inventory report

router.get("/inventoryEntries", async (req, res) => {
  try {
    let { fromDate, toDate } = req.query;

    const today = new Date();

    // ✅ Default Dates
    if (!toDate) {
      toDate = today.toISOString().split("T")[0];
    }

    if (!fromDate) {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      fromDate = firstDay.toISOString().split("T")[0];
    }

    const pool = await getConnection();

    const result = await pool.request()
  .input("fromDate", sql.Date, fromDate)
  .input("toDate", sql.Date, toDate)
  .query(`
     SELECT 
        si.id,
        si.TransferID,
        si.ProductName,
        si.ProductImage,
        si.IssuedWt,
		si.status,
		smaster.StatusName,
        si.CreatedDate,
        si.transferedDate,
		si.receivedDate,
		si.completedDate,
        si.createdBy,
        si.remarks,
        si.rejectRemark
      FROM studioInventory si
	  join statusmasterstudio smaster on smaster.statuscode =  si.status
    WHERE si.CreatedDate >= @fromDate 
    AND si.CreatedDate < DATEADD(DAY,1,@toDate)
    ORDER BY si.CreatedDate DESC
  `);

// 🔥 VERY IMPORTANT FIX
const data = result.recordset.map(row => {
  let base64Image = null;

  if (row.ProductImage) {
    // Ensure it's Buffer
    const buffer = Buffer.isBuffer(row.ProductImage)
      ? row.ProductImage
      : Buffer.from(row.ProductImage);

    base64Image = buffer.toString("base64");
  }

  return {
    ...row,
    ProductImage: base64Image
  };
});

res.json(data);

  } catch (err) {
    console.error("FETCH INVENTORY ERROR:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
});

//  TransferedEntries
router.get("/TransferedEntries", async (req, res) => {
  try {
    let { fromDate, toDate } = req.query;

    const today = new Date();

    // ✅ Default Dates
    if (!toDate) {
      toDate = today.toISOString().split("T")[0];
    }

    if (!fromDate) {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      fromDate = firstDay.toISOString().split("T")[0];
    }

    const pool = await getConnection();

    const result = await pool.request()
  .input("fromDate", sql.Date, fromDate)
  .input("toDate", sql.Date, toDate)
  .query(`
     SELECT 
        si.id,
        si.TransferID,
        si.ProductName,
        si.ProductImage,
        si.IssuedWt,
		si.status,
		smaster.StatusName,
        si.CreatedDate,
        si.transferedDate,
		si.receivedDate,
		si.completedDate,
        si.createdBy,
        si.remarks,
        si.rejectRemark
      FROM studioInventory si
	  join statusmasterstudio smaster on smaster.statuscode =  si.status
    WHERE si.CreatedDate >= @fromDate 
    AND si.CreatedDate < DATEADD(DAY,1,@toDate)
    AND status >= 1
    ORDER BY si.CreatedDate DESC
  `);

// 🔥 VERY IMPORTANT FIX
const data = result.recordset.map(row => {
  let base64Image = null;

  if (row.ProductImage) {
    // Ensure it's Buffer
    const buffer = Buffer.isBuffer(row.ProductImage)
      ? row.ProductImage
      : Buffer.from(row.ProductImage);

    base64Image = buffer.toString("base64");
  }

  return {
    ...row,
    ProductImage: base64Image
  };
});

res.json(data);

  } catch (err) {
    console.error("FETCH INVENTORY ERROR:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
});


// Update status 

// router.post("/updateStatus", async (req, res) => {
//   const { id, status, remarks } = req.body;

//   if (!id || !status) {
//     return res.status(400).json({ message: "ID and status are required" });
//   }

//   // Map status names to numeric codes
//   const statusMap = {
//     TRANSFER: { code: 1, column: "transferedDate" },
//     REJECT: { code: 2, column: "receivedDate" },
//     RECEIVE: { code: 3, column: "receivedDate" },
//     COMPLETE: { code: 4, column: "completedDate" },
//   };

//   const statusInfo = statusMap[status.toUpperCase()]; // ensure case-insensitive

//   if (!statusInfo) {
//     return res.status(400).json({ message: "Invalid status value" });
//   }

//   try {
//     const pool = await getConnection();
//     const now = new Date();

//     await pool
//       .request()
//       .input("id", id)
//       .input("status", statusInfo.code)
//       .query(`
//         UPDATE studioInventory 
//         SET status = @status, ${statusInfo.column} = getdate()
//         WHERE id = @id
//       `);

//     res.json({ message: "Status and timestamp updated successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.post("/updateStatus", async (req, res) => {
  const { id, status, remarks } = req.body;

  if (!id || !status) {
    return res.status(400).json({ message: "ID and status are required" });
  }

  const statusMap = {
    TRANSFER: { code: 1, column: "transferedDate" },
    REJECT: { code: 2, column: "receivedDate" },
    RECEIVE: { code: 3, column: "receivedDate" },
    COMPLETE: { code: 4, column: "completedDate" },
  };

  const statusInfo = statusMap[status.toUpperCase()];

  if (!statusInfo) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const pool = await getConnection();

    const request = pool
      .request()
      .input("id", id)
      .input("status", statusInfo.code);

    let query = `
      UPDATE studioInventory 
      SET status = @status, ${statusInfo.column} = GETDATE()
    `;

    // ✅ Only for REJECT → add remarks
    if (status.toUpperCase() === "REJECT") {
      if (!remarks || remarks.trim() === "") {
        return res.status(400).json({ message: "Remarks required for reject" });
      }

      request.input("remarks", remarks);
      query += `, rejectRemark = @remarks`;
    }

    query += ` WHERE id = @id`;

    await request.query(query);

    res.json({ message: "Status updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;