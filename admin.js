// ======================================
// SUPABASE
// ======================================

const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ======================================
// ELEMENTS
// ======================================

const logoutBtn = document.getElementById("logoutBtn");

const adminName = document.getElementById("adminName");
const adminEmail = document.getElementById("adminEmail");
const adminAvatar = document.getElementById("adminAvatar");

const lastRefresh = document.getElementById("lastRefresh");
const activeAdmin = document.getElementById("activeAdmin");


// ======================================
// AUTH CHECK
// ======================================

let currentUser = null;

async function initializeAdmin() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {

        window.location.replace("admin-login.html");
        return;

    }

    const { data: isAdmin } = await supabase.rpc(
        "is_admin",
        {
            p_user_id: session.user.id
        }
    );

    if (!isAdmin) {

        await supabase.auth.signOut();

        window.location.replace("admin-login.html");

        return;

    }

    currentUser = session.user;

    await loadAdminProfile();

    lastRefresh.textContent =
        new Date().toLocaleTimeString();

    activeAdmin.textContent = "Online";

}

initializeAdmin();


// ======================================
// LOAD ADMIN PROFILE
// ======================================

async function loadAdminProfile() {

    const { data, error } = await supabase

        .from("profiles")

        .select(`
            full_name,
            email,
            avatar_url
        `)

        .eq("id", currentUser.id)

        .single();

    if (error) {

        console.error(error);
        return;

    }

    adminName.textContent =
        data.full_name || "Administrator";

    adminEmail.textContent =
        data.email || currentUser.email;

    if (data.avatar_url) {

        adminAvatar.src =
            data.avatar_url;

    }

}


// ======================================
// LOGOUT
// ======================================

logoutBtn.addEventListener("click", async () => {

    await supabase.auth.signOut();

    window.location.replace("admin-login.html");

});
// ======================================
// DASHBOARD STATISTICS
// ======================================

async function loadDashboardStats() {

    try {

        const [

            profiles,

            products,

            inventory,

            orders,

            smsPurchases,

            deposits,

            referrals

        ] = await Promise.all([

            supabase
                .from("profiles")
                .select("*", { count: "exact", head: true }),

            supabase
                .from("products")
                .select("*", { count: "exact", head: true }),

            supabase
                .from("inventory")
                .select("*", { count: "exact", head: true }),

            supabase
                .from("orders")
                .select("total_amount"),

            supabase
                .from("sms_purchases")
                .select("*", { count: "exact", head: true }),

            supabase
                .from("wallet_deposits")
                .select("amount")
                .eq("status", "completed"),

            supabase
                .from("referral_earnings")
                .select("amount")

        ]);

        document.getElementById("totalUsers").textContent =
            profiles.count ?? 0;

        document.getElementById("totalProducts").textContent =
            products.count ?? 0;

        document.getElementById("totalInventory").textContent =
            inventory.count ?? 0;

        document.getElementById("totalOrders").textContent =
            orders.data?.length ?? 0;

        document.getElementById("totalSmsPurchases").textContent =
            smsPurchases.count ?? 0;

        const revenue = (orders.data || []).reduce(

            (sum, order) =>
                sum + Number(order.total_amount || 0),

            0

        );

        document.getElementById("totalRevenue").textContent =
            "₦" + revenue.toLocaleString();

        const depositTotal = (deposits.data || []).reduce(

            (sum, deposit) =>
                sum + Number(deposit.amount || 0),

            0

        );

        document.getElementById("totalDeposits").textContent =
            "₦" + depositTotal.toLocaleString();

        const referralTotal = (referrals.data || []).reduce(

            (sum, item) =>
                sum + Number(item.amount || 0),

            0

        );

        document.getElementById("totalReferralEarnings").textContent =
            "₦" + referralTotal.toLocaleString();

    } catch (error) {

        console.error("Dashboard stats error:", error);

    }

}

loadDashboardStats();
// ======================================
// RECENT ORDERS
// ======================================

async function loadRecentOrders() {

    const container =
        document.getElementById("recentOrders");

    try {

        const { data, error } = await supabase

            .from("admin_orders_view")

            .select("*")

            .order("created_at", { ascending: false })

            .limit(10);

        if (error) throw error;

        if (!data || data.length === 0) {

            container.innerHTML = `

                <div class="empty-state">

                    <h3>No orders yet</h3>

                    <p>No customer orders have been placed.</p>

                </div>

            `;

            return;

        }

        container.innerHTML = "";

        data.forEach(order => {

            const item = document.createElement("div");

            item.className = "order-item";

            item.innerHTML = `

                <div class="order-left">

                    <h4>${order.email ?? "Unknown User"}</h4>

                    <p>${order.product_name ?? "Product"}</p>

                </div>

                <div class="order-right">

                    <div class="order-price">

                        ₦${Number(order.total_amount || 0).toLocaleString()}

                    </div>

                </div>

            `;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(error);

        container.innerHTML = `

            <div class="empty-state">

                <h3>Unable to load orders</h3>

                <p>Please refresh the page.</p>

            </div>

        `;

    }

}

loadRecentOrders();


// ======================================
// AUTO REFRESH TIME
// ======================================

setInterval(() => {

    lastRefresh.textContent =
        new Date().toLocaleTimeString();

}, 1000);


// ======================================
// AUTH LISTENER
// ======================================

supabase.auth.onAuthStateChange(async (event, session) => {

    if (!session) {

        window.location.replace("admin-login.html");
        return;

    }

    const { data: isAdmin } = await supabase.rpc(

        "is_admin",

        {

            p_user_id: session.user.id

        }

    );

    if (!isAdmin) {

        await supabase.auth.signOut();

        window.location.replace("index.html");

    }

});
