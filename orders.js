const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const ordersTable =
document.getElementById("ordersTable");

const emptyState =
document.getElementById("emptyState");

const searchInput =
document.getElementById("searchInput");

const statusFilter =
document.getElementById("statusFilter");

let orders = [];
let filteredOrders = [];

async function checkAdmin(){

    const {data,error} =
    await supabaseClient.auth.getUser();

    if(error || !data.user){

        window.location.href =
        "../login.html";

        return null;

    }

    const {data:isAdmin,error:adminError} =
    await supabaseClient.rpc(
        "is_admin",
        {
            p_user_id:data.user.id
        }
    );

    if(adminError || !isAdmin){

        alert("Access denied.");

        window.location.href =
        "../index.html";

        return null;

    }

    return data.user;

}

async function loadOrders(){

    const {data,error} =
    await supabaseClient
    .from("admin_orders_view")
    .select("*")
    .order(
        "created_at",
        {
            ascending:false
        }
    );

    if(error){

        throw error;

    }

    orders =
    data || [];

    filteredOrders =
    [...orders];

    renderOrders();

}

function formatMoney(amount){

    return "₦" +
    Number(amount || 0)
    .toLocaleString();

}

function renderOrders(){

    if(filteredOrders.length === 0){

        ordersTable.innerHTML = "";

        emptyState.style.display =
        "block";

        return;

    }

    emptyState.style.display =
    "none";

    ordersTable.innerHTML = "";
filteredOrders.forEach(order=>{

    ordersTable.innerHTML += `

    <tr>

        <td>

        ${order.id}

        </td>

        <td>

        ${order.user_id}

        </td>

        <td>

        ${order.product_name}

        </td>

        <td>

        ${formatMoney(order.total_amount)}

        </td>

        <td>

        <span class="status ${order.status}">

        ${order.status}

        </span>

        </td>

        <td>

        ${new Date(
            order.created_at
        ).toLocaleDateString()}

        </td>

        <td>

        <a
        class="view-btn"
        href="order-details.html?id=${order.id}">

        View

        </a>

        </td>

    </tr>

    `;

});

}

function applyFilters(){

    const search =
    searchInput.value
    .toLowerCase()
    .trim();

    const status =
    statusFilter.value;

    filteredOrders =
    orders.filter(order=>{

        const matchSearch =
        order.id
        .toLowerCase()
        .includes(search);

        const matchStatus =
        status === "all" ||
        order.status === status;

        return (
            matchSearch &&
            matchStatus
        );

    });

    renderOrders();

}

searchInput.addEventListener(
"input",
applyFilters
);

statusFilter.addEventListener(
"change",
applyFilters
);

async function init(){

    try{

        const admin =
        await checkAdmin();

        if(!admin){

            return;

        }

        await loadOrders();

    }catch(error){

        console.error(error);

        ordersTable.innerHTML = `

        <tr>

        <td colspan="7"
        style="text-align:center;">

        Failed to load orders

        </td>

        </tr>

        `;

    }

}

init();
