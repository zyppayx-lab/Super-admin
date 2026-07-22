const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const totalUsers =
document.getElementById("totalUsers");

const totalProducts =
document.getElementById("totalProducts");

const totalInventory =
document.getElementById("totalInventory");

const pendingOrders =
document.getElementById("pendingOrders");

const totalRevenue =
document.getElementById("totalRevenue");

const recentOrders =
document.getElementById("recentOrders");

const logoutBtn =
document.getElementById("logoutBtn");

function formatMoney(amount){

    return "₦" +
    Number(amount || 0).toLocaleString();

}

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

        alert("Access denied");

        window.location.href =
        "../index.html";

        return null;

    }

    return data.user;

}

async function loadDashboardStats(){

    try{

        const {data,error} =
        await supabaseClient.rpc(
            "admin_dashboard_stats"
        );

        if(error){

            throw error;

        }

        const stats =
        data[0];

        totalUsers.textContent =
        stats.total_users;

        totalProducts.textContent =
        stats.total_products;

        totalInventory.textContent =
        stats.total_inventory;

        pendingOrders.textContent =
        stats.pending_orders;

        totalRevenue.textContent =
        formatMoney(
            stats.total_revenue
        );

    }catch(error){

        console.error(error);

    }

}
async function loadRecentOrders(){

    try{

        const {data,error} =
        await supabaseClient
        .from("admin_orders_view")
        .select(`
            product_name,
            total_amount,
            status,
            created_at
        `)
        .order(
            "created_at",
            {
                ascending:false
            }
        )
        .limit(10);

        if(error){

            throw error;

        }

        if(!data || data.length===0){

            recentOrders.innerHTML = `

            <tr>

                <td colspan="4">

                    No recent orders

                </td>

            </tr>

            `;

            return;

        }

        recentOrders.innerHTML = "";

        data.forEach(order=>{

            recentOrders.innerHTML += `

            <tr>

                <td>

                    ${order.product_name}

                </td>

                <td>

                    ${formatMoney(
                        order.total_amount
                    )}

                </td>

                <td>

                    ${order.status}

                </td>

                <td>

                    ${new Date(
                        order.created_at
                    ).toLocaleDateString()}

                </td>

            </tr>

            `;

        });

    }catch(error){

        console.error(error);

        recentOrders.innerHTML = `

        <tr>

            <td colspan="4">

                Failed to load orders

            </td>

        </tr>

        `;

    }

}

logoutBtn.addEventListener(
"click",
async(event)=>{

    event.preventDefault();

    const confirmLogout =
    confirm(
        "Are you sure you want to logout?"
    );

    if(!confirmLogout){
        return;
    }

    await supabaseClient.auth.signOut();

    window.location.href =
    "../login.html";

});

async function init(){

    const user =
    await checkAdmin();

    if(!user){
        return;
    }

    await Promise.all([

        loadDashboardStats(),

        loadRecentOrders()

    ]);

}

init();
