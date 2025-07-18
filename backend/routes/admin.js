const router = require("express").Router();
const { query } = require("../database/dbpromise.js");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const adminValidator = require("../middlewares/admin.js");
const {
  updateUserPlan,
  getFileExtension,
  sendEmail,
  isValidEmail,
} = require("../functions/function.js");
const moment = require("moment");
const { recoverEmail } = require("../emails/returnEmails.js");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        msg: "Please fill email and password",
      });
    }
    // check for user
    const userFind = await query(`SELECT * FROM admin WHERE email = ?`, [
      email,
    ]);
    if (userFind.length < 1) {
      return res.json({ msg: "Invalid credentials found" });
    }

    const compare = await bcrypt.compare(password, userFind[0].password);
    if (!compare) {
      return res.json({ msg: "Invalid credentials" });
    } else {
      const token = sign(
        {
          uid: userFind[0].uid,
          role: "admin",
          password: userFind[0].password,
          email: userFind[0].email,
        },
        process.env.JWTKEY,
        {}
      );
      res.json({
        success: true,
        token,
      });
    }
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// add new plan
router.post("/add_plan", adminValidator, async (req, res) => {
  try {
    const {
      title,
      short_description,
      allow_tag,
      allow_note,
      allow_chatbot,
      contact_limit,
      allow_api,
      is_trial,
      price,
      price_strike,
      plan_duration_in_days,
      qr_account,
      wa_warmer,
      rest_api_qr,
    } = req.body;

    if (!title || !short_description || !plan_duration_in_days) {
      return res.json({ success: false, msg: " Please fill details" });
    }

    await query(
      `INSERT INTO plan (title, short_description, allow_tag, allow_note, allow_chatbot, 
            contact_limit, allow_api, is_trial, price, price_strike, plan_duration_in_days, qr_account, wa_warmer, rest_api_qr) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        title,
        short_description,
        allow_tag ? 1 : 0,
        allow_note ? 1 : 0,
        allow_chatbot ? 1 : 0,
        parseInt(contact_limit || 0),
        allow_api ? 1 : 0,
        is_trial ? 1 : 0,
        is_trial ? 0 : price,
        price_strike,
        parseInt(plan_duration_in_days || 1),
        parseInt(qr_account) > 0 ? parseInt(qr_account) : 0,
        wa_warmer ? 1 : 0,
        rest_api_qr ? 1 : 0,
      ]
    );

    res.json({ success: true, msg: "Plan has been updated" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get plans
router.get("/get_plans", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM plan`, []);
    res.json({ success: true, data });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get web public
router.get("/get_web_public", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM web_public`, []);
    res.json({ data: data[0], success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// del plan
router.post("/del_plan", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;

    await query(`DELETE FROM plan WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Plan was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get all users
router.get("/get_users", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM user`, []);
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// update user
router.post("/update_user", adminValidator, async (req, res) => {
  try {
    const { newPassword, name, email, mobile_with_country_code, uid } =
      req.body;

    console.log(req.body);

    if (!uid || !name || !email || !mobile_with_country_code) {
      return res.json({
        success: false,
        msg: "You forgot to enter some field(s)",
      });
    }

    const findUserByEmail = await query(`SELECT * FROM user WHERE email = ?`, [
      email,
    ]);
    if (findUserByEmail.length > 0 && findUserByEmail[0].uid !== uid) {
      return res.json({ msg: "This email is already taken by another user" });
    }

    if (newPassword) {
      const findUserByUid = await query(`SELECT * FROM user WHERE uid = ?`, [
        uid,
      ]);
      if (findUserByUid.length === 0) {
        return res.json({ msg: "User not found" });
      }
    } else {
      if (newPassword) {
        const hashpass = await bcrypt.hash(newPassword, 10);

        await query(
          `UPDATE user SET name = ?, email = ?, password = ?, mobile_with_country_code = ? WHERE uid = ?`,
          [name, email, hashpass, mobile_with_country_code, uid]
        );
      } else {
        await query(
          `UPDATE user SET name = ?, email = ?, mobile_with_country_code = ? WHERE uid = ?`,
          [name, email, mobile_with_country_code, uid]
        );
      }
      res.json({ msg: "User was updated", success: true });
    }
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// update plan
router.post("/update_plan", adminValidator, async (req, res) => {
  try {
    const { plan, uid } = req.body;

    if (!plan || !uid) {
      return res.json({ success: false, msg: "Invalid input provided" });
    }

    const getPlan = await query(`SELECT * FROM plan WHERE id = ?`, [plan?.id]);
    if (getPlan.length < 1) {
      return res.json({ success: false, msg: "Invalid plan found" });
    }

    await updateUserPlan(getPlan[0], uid);

    res.json({ success: true, msg: "User plan was updated" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get payment gateway admin
router.get("/get_payment_gateway_admin", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM web_private`, []);
    if (data.length < 1) {
      return res.json({ data: {}, success: true });
    }
    res.json({ data: data[0], success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// update payment gateway
router.post("/update_pay_gateway", adminValidator, async (req, res) => {
  try {
    const {
      pay_offline_id,
      pay_offline_key,
      offline_active,
      pay_stripe_id,
      pay_stripe_key,
      stripe_active,
      pay_paypal_id,
      pay_paypal_key,
      paypal_active,
      rz_id,
      rz_key,
      rz_active,
      pay_paystack_id,
      pay_paystack_key,
      paystack_active,
    } = req.body;

    await query(
      `UPDATE web_private SET  
            pay_offline_id = ?, 
            pay_offline_key = ?, 
            offline_active = ?,
            pay_stripe_id = ?, 
            pay_stripe_key = ?, 
            stripe_active = ?,
            pay_paypal_id = ?,
            pay_paypal_key = ?,
            paypal_active = ?,
            rz_id = ?,
            rz_key = ?,
            rz_active = ?,
            pay_paystack_id = ?,
            pay_paystack_key = ?,
            paystack_active = ?
            `,
      [
        pay_offline_id,
        pay_offline_key,
        offline_active,
        pay_stripe_id,
        pay_stripe_key,
        stripe_active,
        pay_paypal_id,
        pay_paypal_key,
        paypal_active,
        rz_id,
        rz_key,
        rz_active,
        pay_paystack_id,
        pay_paystack_key,
        paystack_active,
      ]
    );

    res.json({ success: true, msg: "Payment gateway updated" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// add partners logo
router.post("/add_brand_image", adminValidator, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.json({ success: false, msg: "No files were uploaded" });
    }

    const randomString = randomstring.generate();
    const file = req.files.file;

    const filename = `${randomString}.${getFileExtension(file.name)}`;

    file.mv(`${__dirname}/../client/public/media/${filename}`, (err) => {
      if (err) {
        console.log(err);
        return res.json({ err });
      }
    });

    await query(`INSERT INTO partners (filename) VALUES (?)`, [filename]);

    res.json({ success: true, msg: "Logo was uploaded" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get all brands
router.get("/get_brands", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM partners`, []);
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// del image
router.post("/del_brand_logo", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE from partners WHERE id = ?`, [id]);

    res.json({ success: true, msg: "Bran was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// add faq
router.post("/add_faq", adminValidator, async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!answer || !question) {
      return res.json({
        success: false,
        msg: "Please provide question and answer both",
      });
    }

    await query(`INSERT INTO faq (question, answer) VALUES (?,?)`, [
      question,
      answer,
    ]);

    res.json({ success: true, msg: "Faq was added" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get all faq
router.get("/get_faq", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM faq`, []);
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// del faq
router.post("/del_faq", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM faq WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Faq was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// add page
router.post("/add_page", adminValidator, async (req, res) => {
  try {
    const { title, content, slug } = req.body;

    if (!title || !content || !slug) {
      return res.json({ success: false, msg: "Please fill all fields" });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.json({ success: false, msg: "No image was selected" });
    }

    // checking few pages
    const pageAlready = [
      "contact-form",
      "privacy-policy",
      "terms-and-conditions",
    ];

    if (pageAlready.includes(slug)) {
      return res.json({
        msg: "This slug is already used by system please use another slug.",
      });
    }

    // checking already one
    const getPage = await query(`SELECT * FROM page WHERE slug = ?`, [slug]);
    if (getPage.length > 0) {
      return res.json({
        success: false,
        msg: "Thi slug was already used by another page.",
      });
    }

    const randomString = randomstring.generate();
    const file = req.files.file;

    const filename = `${randomString}.${getFileExtension(file.name)}`;

    file.mv(`${__dirname}/../client/public/media/${filename}`, (err) => {
      if (err) {
        console.log(err);
        return res.json({ err });
      }
    });

    await query(
      `INSERT INTO page (slug, title, image, content) VALUES (?,?,?,?)`,
      [slug, title, filename, content]
    );

    res.json({ success: true, msg: "Page was added" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// get all pages
router.get("/get_pages", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM page WHERE permanent = ?`, [0]);
    res.json({ data, success: true });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// del page
router.post("/del_page", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;

    await query(`DELETE FROM page WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Page was deleted" });
  } catch (err) {
    res.json({ success: false, msg: "something went wrong" });
    console.log(err);
  }
});

// auto user login
router.post("/auto_login", adminValidator, async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.json({ success: false, msg: "Invalid input" });
    }

    const user = await query(`SELECT * FROM user WHERE uid = ?`, [uid]);
    const token = sign(
      {
        uid: user[0].uid,
        role: "user",
        password: user[0].password,
        email: user[0].email,
      },
      process.env.JWTKEY,
      {}
    );
    console.log(token);
    res.json({
      success: true,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// ading testtimonial
router.post("/add_testimonial", adminValidator, async (req, res) => {
  try {
    const { title, description, reviewer_name, reviewer_position } = req.body;

    if (!title || !description || !reviewer_name || !reviewer_position) {
      return res.json({ success: false, msg: "Please fill all fields" });
    }

    await query(
      `INSERT INTO testimonial (title, description, reviewer_name, reviewer_position) VALUES (?,?,?,?)`,
      [title, description, reviewer_name, reviewer_position]
    );

    res.json({ success: true, msg: "Testimonial was added" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get all testi
router.get("/get_testi", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM testimonial`, []);
    res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// del testi
router.post("/del_testi", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;

    await query(`DELETE FROM testimonial WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Testimonial was deleted" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get orders
router.get("/get_orders", adminValidator, async (req, res) => {
  try {
    const data = await query(
      `
            SELECT 
                orders.id,
                orders.uid,
                orders.payment_mode,
                orders.amount,
                orders.data,
                orders.s_token,
                orders.createdAt AS orderCreatedAt,
                user.role,
                user.name,
                user.email,
                user.password,
                user.mobile_with_country_code,
                user.timezone,
                user.plan,
                user.plan_expire,
                user.trial,
                user.api_key,
                user.createdAt AS userCreatedAt
            FROM orders
            LEFT JOIN user ON orders.uid = user.uid
        `,
      []
    );

    res.json({ data, success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get all contact forms
router.get("/get_contact_leads", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM contact_form`, []);
    res.json({ data, success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// del contact entry
router.post("/del_cotact_entry", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM contact_form WHERE id = ?`, [id]);
    res.json({ success: true, msg: "Entry was deleted" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get page by slug
router.post("/get_page_slug", async (req, res) => {
  try {
    const { slug } = req.body;

    const data = await query(`SELECT * FROM page WHERE slug = ?`, [slug]);
    if (data.length < 1) {
      return res.json({ data: {}, success: true, page: false });
    } else {
      return res.json({ data: data[0], success: true, page: true });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});
// update termns
router.post("/update_terms", adminValidator, async (req, res) => {
  try {
    const { title, content } = req.body;

    // check
    const getPP = await query(`SELECT * FROM page WHERE slug = ?`, [
      "terms-and-conditions",
    ]);

    if (getPP.length > 0) {
      await query(`UPDATE page SET title = ?, content = ? WHERE slug = ?`, [
        title,
        content,
        "terms-and-conditions",
      ]);
    } else {
      await query(
        `INSERT INTO page (slug, title, content, permanent) VALUES (?,?,?,?)`,
        ["terms-and-conditions", title, content, 1]
      );
    }

    res.json({ success: true, msg: "Page updated" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// update privacy policy
router.post("/update_privacy_policy", adminValidator, async (req, res) => {
  try {
    const { title, content } = req.body;

    // check
    const getPP = await query(`SELECT * FROM page WHERE slug = ?`, [
      "privacy-policy",
    ]);

    if (getPP.length > 0) {
      await query(`UPDATE page SET title = ?, content = ? WHERE slug = ?`, [
        title,
        content,
        "privacy-policy",
      ]);
    } else {
      await query(
        `INSERT INTO page (slug, title, content, permanent) VALUES (?,?,?,?)`,
        ["privacy-policy", title, content, 1]
      );
    }

    res.json({ success: true, msg: "Page updated" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get smtp
router.get("/get_smtp", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM smtp`, []);
    if (data.length < 1) {
      return res.json({ data: { id: "ID" }, success: true });
    } else {
      return res.json({ data: data[0], success: true });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// update smtp
router.post("/update_smtp", adminValidator, async (req, res) => {
  try {
    const { email, port, password, host, username } = req.body;

    if (!email || !port || !password || !host || !username) {
      return res.json({ msg: "Please fill all the fields" });
    }

    const getOne = await query(`SELECT * FROM smtp`, []);
    if (getOne.length < 1) {
      await query(
        `INSERT INTO smtp (email, host, port, password, username) VALUES (?,?,?,?)`,
        [email, host, port, password, username]
      );
    } else {
      await query(
        `UPDATE smtp SET email = ?, host = ?, port = ?, password = ?, username = ?`,
        [email, host, port, password, username]
      );
    }

    res.json({ success: true, msg: "Email settings was updated" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// send test email
router.post("/send_test_email", adminValidator, async (req, res) => {
  try {
    const { email, port, password, host, to, username } = req.body;

    if (!email || !port || !password || !host || !username) {
      return res.json({ msg: "Please fill all the fields" });
    }

    const checkEmail = await sendEmail(
      host,
      port,
      email,
      password,
      `<h1>This is a test SMTP email!</h1>`,
      "SMTP Testing",
      "Testing Sender",
      to,
      username
    );

    if (checkEmail.success) {
      res.json({ msg: "Email sent", success: true });
    } else {
      res.json({ msg: checkEmail?.err });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// get dashboard for user
router.get("/get_dashboard_for_user", adminValidator, async (req, res) => {
  try {
    // Get users data
    const getUsers = await query(`SELECT * FROM user`, []);
    const { paidSignupsByMonth, unpaidSignupsByMonth } =
      getUserSignupsByMonth(getUsers);

    // Get orders data
    const getOrders = await query(`SELECT * FROM orders`, []);
    const orders = getUserOrderssByMonth(getOrders);

    // Get contact form data
    const getContactForm = await query(`SELECT * FROM contact_form`, []);

    // Get chats data
    const getChats = await query(`SELECT * FROM beta_chats`, []);
    const chatsByMonth = getChatsByMonth(getChats);

    // Get conversations data
    const getConversations = await query(`SELECT * FROM beta_conversation`, []);
    const messagesByMonth = getMessagesByMonth(getConversations);

    // Get message types distribution
    const messageTypes = getMessageTypeDistribution(getConversations);

    // Get agents data
    const getAgents = await query(`SELECT * FROM agents`, []);

    // Get agent tasks data
    const getAgentTasks = await query(`SELECT * FROM agent_task`, []);
    const agentPerformance = getAgentPerformance(getAgents, getAgentTasks);

    // Get instances data (WhatsApp connections)
    const getInstances = await query(`SELECT * FROM instance`, []);
    const activeInstances = getInstances.filter(
      (instance) => instance.status === "ACTIVE"
    ).length;

    // Get flows data
    const getFlows = await query(`SELECT * FROM beta_flows`, []);

    // Get system metrics (this would typically come from a monitoring service)
    const systemMetrics = {
      serverLoad: Math.floor(Math.random() * 60) + 20, // Simulated data between 20-80%
      memoryUsage: Math.floor(Math.random() * 40) + 30, // Simulated data between 30-70%
      diskSpace: Math.floor(Math.random() * 30) + 10, // Simulated data between 10-40%
      activeSessions:
        getUsers.length > 0 ? Math.floor(getUsers.length * 0.7) : 0,
    };

    // Get recent users (last 5)
    const recentUsers = getUsers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: JSON.parse(user.plan || "{}").title || "No Plan",
        date: new Date(user.createdAt).toISOString().split("T")[0],
      }));

    // Get recent transactions (last 5)
    const recentTransactions = getOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((order) => {
        const user = getUsers.find((u) => u.uid === order.uid);
        return {
          id: order.id,
          user: user ? user.name : "Unknown",
          amount: `$${order.amount}`,
          plan: "Subscription",
          status: "Completed",
          date: new Date(order.createdAt).toISOString().split("T")[0],
        };
      });

    res.json({
      data: {
        // User data
        paid: paidSignupsByMonth,
        unpaid: unpaidSignupsByMonth,
        userLength: getUsers.length,
        recentUsers,

        // Financial data
        orders,
        orderLength: getOrders.length,
        recentTransactions,

        // Contact and chat data
        contactLength: getContactForm.length,
        chatLength: getChats.length,
        chatsByMonth,
        messagesByMonth,
        messageTypes,

        // Agent data
        agentLength: getAgents.length,
        agentPerformance,

        // System data
        activeInstances,
        flowsLength: getFlows.length,
        systemMetrics,
      },
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// Helper function to get user signups by month
function getUserSignupsByMonth(users) {
  const paidSignupsByMonth = Array(12).fill(0);
  const unpaidSignupsByMonth = Array(12).fill(0);

  users.forEach((user) => {
    const createdAt = new Date(user.createdAt);
    const month = createdAt.getMonth();

    // Check if user has a paid plan
    const plan = JSON.parse(user.plan || "{}");
    const isPaid = plan && plan.is_trial === 0;

    if (isPaid) {
      paidSignupsByMonth[month]++;
    } else {
      unpaidSignupsByMonth[month]++;
    }
  });

  return { paidSignupsByMonth, unpaidSignupsByMonth };
}

// Helper function to get orders by month
function getUserOrderssByMonth(orders) {
  const ordersByMonth = Array(12).fill(0);

  orders.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    const month = createdAt.getMonth();
    const amount = parseFloat(order.amount) || 0;

    ordersByMonth[month] += amount;
  });

  return ordersByMonth;
}

// Helper function to get chats by month
function getChatsByMonth(chats) {
  const chatsByMonth = Array(12).fill(0);

  chats.forEach((chat) => {
    const createdAt = new Date(chat.createdAt);
    const month = createdAt.getMonth();

    chatsByMonth[month]++;
  });

  return chatsByMonth;
}

// Helper function to get messages by month
function getMessagesByMonth(conversations) {
  const messagesByMonth = Array(12).fill(0);

  conversations.forEach((conversation) => {
    const createdAt = new Date(conversation.createdAt);
    const month = createdAt.getMonth();

    messagesByMonth[month]++;
  });

  return messagesByMonth;
}

// Helper function to get message type distribution
function getMessageTypeDistribution(conversations) {
  const types = {
    text: 0,
    image: 0,
    video: 0,
    document: 0,
    location: 0,
    contact: 0,
    other: 0,
  };

  conversations.forEach((conversation) => {
    try {
      const msgContext = JSON.parse(conversation.msgContext || "{}");
      const type = msgContext.type || "other";

      if (types[type] !== undefined) {
        types[type]++;
      } else {
        types.other++;
      }
    } catch (error) {
      types.other++;
    }
  });

  return [
    types.text,
    types.image,
    types.video,
    types.document,
    types.location,
    types.contact,
    types.other,
  ];
}

// Helper function to get agent performance
function getAgentPerformance(agents, tasks) {
  return agents.slice(0, 3).map((agent) => {
    const agentTasks = tasks.filter((task) => task.uid === agent.uid);
    const completedTasks = agentTasks.filter(
      (task) => task.status === "COMPLETED"
    ).length;
    const completionRate =
      agentTasks.length > 0 ? (completedTasks / agentTasks.length) * 100 : 0;

    // Generate some random metrics for demo purposes
    return {
      name: agent.name,
      data: [
        Math.floor(Math.random() * 30) + 70, // Response time (70-100)
        completionRate || Math.floor(Math.random() * 20) + 75, // Resolution rate
        Math.floor(Math.random() * 15) + 80, // Customer rating
        Math.floor(Math.random() * 25) + 70, // Chats handled
        Math.floor(Math.random() * 20) + 75, // Tasks completed
      ],
    };
  });
}

// get dashboard user
// router.get("/get_dashboard_for_user", adminValidator, async (req, res) => {
//   try {
//     const getUsers = await query(`SELECT * FROM user`, []);
//     const { paidSignupsByMonth, unpaidSignupsByMonth } =
//       getUserSignupsByMonth(getUsers);

//     const getOrders = await query(`SELECT * FROM orders`, []);
//     const orders = getUserOrderssByMonth(getOrders);

//     const getContactForm = await query(`SELECT * FROM contact_form`, []);

//     res.json({
//       data: {
//         paid: paidSignupsByMonth,
//         unpaid: unpaidSignupsByMonth,
//         orders,
//         userLength: getUsers.length,
//         orderLength: getOrders.length,
//         contactLength: getContactForm.length,
//       },
//       success: true,
//     });
//   } catch (err) {
//     console.log(err);
//     res.json({ msg: "server error", err });
//   }
// });

// get admin
router.get("/get_admin", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM admin`, []);
    res.json({ data: data[0], success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// update admin
router.post("/update-admin", adminValidator, async (req, res) => {
  try {
    if (req.body.newpass) {
      const hash = await bcrypt.hash(req.body.newpass, 10);
      await query(`UPDATE admin SET email = ?, password = ? WHERE uid = ?`, [
        req.body.email,
        hash,
        req.decode.uid,
      ]);
      res.json({ success: true, msg: "Admin was updated refresh the page" });
    } else {
      await query(`UPDATE admin SET email = ? WHERE uid = ?`, [
        req.body.email,
        req.decode.uid,
      ]);
      res.json({ success: true, msg: "Admin was updated refresh the page" });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

// send recover
router.post("/send_resovery", async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.json({ msg: "Please enter a valid email" });
    }

    const checkEmailValid = await query(`SELECT * FROM admin WHERE email = ?`, [
      email,
    ]);
    if (checkEmailValid.length < 1) {
      return res.json({
        success: true,
        msg: "We have sent a recovery link if this email is associated with admin account.",
      });
    }

    const getWeb = await query(`SELECT * FROM web_public`, []);
    const appName = getWeb[0]?.app_name;

    const jsontoken = sign(
      {
        old_email: email,
        email: email,
        time: moment(new Date()),
        password: checkEmailValid[0]?.password,
        role: "admin",
      },
      process.env.JWTKEY,
      {}
    );

    const recpveryUrl = `${process.env.FRONTENDURI}/recovery-admin/${jsontoken}`;

    const getHtml = recoverEmail(appName, recpveryUrl);

    // getting smtp
    const smtp = await query(`SELECT * FROM smtp`, []);
    if (
      !smtp[0]?.email ||
      !smtp[0]?.host ||
      !smtp[0]?.port ||
      !smtp[0]?.password ||
      !smtp[0]?.username
    ) {
      return res.json({
        success: false,
        msg: "SMTP connections not found! Unable to send recovery link",
      });
    }

    await sendEmail(
      smtp[0]?.host,
      smtp[0]?.port,
      smtp[0]?.email,
      smtp[0]?.password,
      getHtml,
      `${appName} - Password Recovery`,
      smtp[0]?.email,
      email,
      smtp[0]?.username
    );

    res.json({
      success: true,
      msg: "We have sent your a password recovery link. Please check your email",
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// modify recpvery passwrod
router.get("/modify_password", adminValidator, async (req, res) => {
  try {
    const { pass } = req.query;

    if (!pass) {
      return res.json({ success: false, msg: "Please provide a password" });
    }

    if (moment(req.decode.time).diff(moment(new Date()), "hours") > 1) {
      return res.json({ success: false, msg: "Token expired" });
    }

    const hashpassword = await bcrypt.hash(pass, 10);

    const result = await query(
      `UPDATE admin SET password = ? WHERE email = ?`,
      [hashpassword, req.decode.old_email]
    );

    res.json({
      success: true,
      msg: "Your password has been changed. You may login now! Redirecting...",
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// del user
router.post("/del_user", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM user WHERE id = ?`, [id]);
    res.json({ success: true, msg: "User was deletd" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// get all genn wa links
router.get("/get_wa_gen", adminValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM gen_links`, []);
    res.json({ data, success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// del gen link
router.post("/de_wa_den_link", adminValidator, async (req, res) => {
  try {
    const { id } = req.body;
    await query(`DELETE FROM gen_links WHERE id = ?`, [id]);
    res.json({ msg: "Generated link was deleted", success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// get social login
router.get("/get_social_login", async (req, res) => {
  try {
    const data = await query(`SELECT * FROM web_public`, []);
    res.json({ data: data[0], success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// update social things
router.post("/update_social_login", adminValidator, async (req, res) => {
  try {
    const {
      google_client_id,
      google_login_active,
      fb_login_app_id,
      fb_login_app_sec,
      fb_login_active,
    } = req.body;

    await query(
      `UPDATE web_public SET google_client_id = ?, google_login_active = ?, fb_login_app_id = ?, fb_login_app_sec = ?, fb_login_active = ?`,
      [
        google_client_id,
        google_login_active,
        fb_login_app_id,
        fb_login_app_sec,
        fb_login_active,
      ]
    );

    res.json({ msg: "Settings updated", success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

// update rtl
router.post("/update_rtl", adminValidator, async (req, res) => {
  try {
    const { rtl } = req.body;

    await query(`UPDATE web_public SET rtl = ?`, [rtl ? 1 : 0]);

    res.json({ success: true, msg: "RTL was updated" });
  } catch (err) {
    console.log(err);
    res.json({ msg: "Something went wrong", err, success: false });
  }
});

module.exports = router;
