const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const userId =
new URLSearchParams(
    window.location.search
).get("id");

const fullName =
document.getElementById("fullName");

const email =
document.getElementById("email");

const role =
document.getElementById("role");

const walletBalance =
document.getElementById("walletBalance");

const referralCode =
document.getElementById("referralCode");

const createdAt =
document.getElementById("createdAt");

const totalOrders =
document.getElementById("totalOrders");

const completedOrders =
document.getElementById("completedOrders");

const totalSpent =
document.getElementById("totalSpent");

const referralEarnings =
document.getElementById("referralEarnings");

const ordersContainer =
document.getElementById("ordersContainer");

const transactionsContainer =
document.getElementById("transactionsContainer");

const makeAdminBtn =
document.getElementById("makeAdminBtn");

const removeAdminBtn =
document.getElementById("removeAdminBtn");

const suspendBtn =
document.getElementById("suspendBtn");

function formatMoney(amount){

    return "₦" +
    Number(amount || 0)
    .toLocaleString();

}

async function checkAdmin(){

    const {data,error} =
    await supabaseClient.auth.getUser();

    if(error || !data.user){

        window.location.href =
        "../login.html";

        return false;

    }

    const {data:isAdmin,error:adminError} =
    await supabaseClient.rpc(
        "is_admin",
        {
            p_user_id:data.user.id
        }
    );

    if(adminError || !isAdmin){

        alert(
            "Access denied."
        );

        window.location.href =
        "dashboard.html";

        return false;

    }

    return true;

}

async function loadProfile(){

    const {data,error} =
    await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id",userId)
    .single();

    if(error){

        throw error;

    }

    fullName.textContent =
    data.full_name || "-";

    email.textContent =
    data.email || "-";

    role.textContent =
    data.role || "user";

    walletBalance.textContent =
    formatMoney(
        data.wallet_balance
    );

    referralCode.textContent =
    data.referral_code || "-";

    createdAt.textContent =
    new Date(
        data.created_at
    ).toLocaleString();

}
async function loadOrders(){

    const {data,error} =
    await supabaseClient
    .from("orders")
    .select("*")
    .eq("user_id",userId)
    .order(
        "created_at",
        {
            ascending:false
        }
    );

    if(error){

        throw error;

    }

    totalOrders.textContent =
    data.length;

    const completed =
    data.filter(order=>
        order.status==="completed"
    );

    completedOrders.textContent =
    completed.length;

    const spent =
    completed.reduce(
        (sum,order)=>
        sum + Number(order.total_amount || 0),
        0
    );

    totalSpent.textContent =
    formatMoney(spent);

    if(data.length===0){

        ordersContainer.innerHTML = `

        <div class="empty">

        No orders found.

        </div>

        `;

        return;

    }

    ordersContainer.innerHTML = "";

    data.forEach(order=>{

        ordersContainer.innerHTML += `

        <div class="list-item">

            <h3>

            Order #${order.id.slice(0,8)}

            </h3>

            <p>

            <strong>Status:</strong>

            ${order.status}

            </p>

            <p>

            <strong>Total:</strong>

            ${formatMoney(order.total_amount)}

            </p>

            <p>

            <strong>Payment:</strong>

            ${order.payment_method || "-"}

            </p>

            <p>

            <strong>Date:</strong>

            ${new Date(order.created_at).toLocaleString()}

            </p>

        </div>

        `;

    });

}

async function loadTransactions(){

    const {data,error} =
    await supabaseClient
    .from("wallet_transactions")
    .select("*")
    .eq("user_id",userId)
    .order(
        "created_at",
        {
            ascending:false
        }
    );

    if(error){

        throw error;

    }

    if(data.length===0){

        transactionsContainer.innerHTML = `

        <div class="empty">

        No wallet transactions.

        </div>

        `;

        return;

    }

    transactionsContainer.innerHTML = "";

    data.forEach(transaction=>{

        transactionsContainer.innerHTML += `

        <div class="list-item">

            <h3>

            ${transaction.type}

            </h3>

            <p>

            <strong>Amount:</strong>

            ${formatMoney(transaction.amount)}

            </p>

            <p>

            <strong>Description:</strong>

            ${transaction.description || "-"}

            </p>

            <p>

            <strong>Date:</strong>

            ${new Date(transaction.created_at).toLocaleString()}

            </p>

        </div>

        `;

    });

    const {data:earnings} =
    await supabaseClient
    .from("referral_earnings")
    .select("amount")
    .eq("referrer_id",userId);

    const total =
    (earnings || []).reduce(
        (sum,item)=>
        sum + Number(item.amount || 0),
        0
    );

    referralEarnings.textContent =
    formatMoney(total);

}
async function makeAdmin(){

    if(!confirm(
        "Make this user an admin?"
    )){

        return;

    }

    try{

        const {error} =
        await supabaseClient
        .from("profiles")
        .update({

            role:"admin"

        })
        .eq(
            "id",
            userId
        );

        if(error){

            throw error;

        }

        alert(
            "User is now an admin."
        );

        await loadProfile();

    }catch(error){

        alert(error.message);

    }

}

async function removeAdmin(){

    if(!confirm(
        "Remove admin privileges?"
    )){

        return;

    }

    try{

        const {error} =
        await supabaseClient
        .from("profiles")
        .update({

            role:"user"

        })
        .eq(
            "id",
            userId
        );

        if(error){

            throw error;

        }

        alert(
            "Admin privileges removed."
        );

        await loadProfile();

    }catch(error){

        alert(error.message);

    }

}

async function suspendUser(){

    alert(
        "Suspend user functionality will be implemented after adding an account_status field and related backend logic."
    );

}

makeAdminBtn.addEventListener(
    "click",
    makeAdmin
);

removeAdminBtn.addEventListener(
    "click",
    removeAdmin
);

suspendBtn.addEventListener(
    "click",
    suspendUser
);

async function init(){

    try{

        const ok =
        await checkAdmin();

        if(!ok){

            return;

        }

        if(!userId){

            alert(
                "Missing user ID."
            );

            window.location.href =
            "users.html";

            return;

        }

        await loadProfile();

        await loadOrders();

        await loadTransactions();

    }catch(error){

        console.error(error);

        alert(
            "Failed to load user details."
        );

    }

}

init();
