const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const orderId =
new URLSearchParams(
    window.location.search
).get("id");

const orderIdElement =
document.getElementById("orderId");

const orderStatusElement =
document.getElementById("orderStatus");

const customerElement =
document.getElementById("customer");

const totalAmountElement =
document.getElementById("totalAmount");

const createdAtElement =
document.getElementById("createdAt");

const paymentMethodElement =
document.getElementById("paymentMethod");

const statusSelect =
document.getElementById("statusSelect");

const saveStatusBtn =
document.getElementById("saveStatusBtn");

const itemsContainer =
document.getElementById("itemsContainer");

let currentOrder = null;

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
        "../dashboard.html";

        return null;

    }

    return data.user;

}

async function loadOrder(){

    const {data,error} =
    await supabaseClient
    .from("orders")
    .select("*")
    .eq("id",orderId)
    .single();

    if(error){

        throw error;

    }

    currentOrder = data;

    orderIdElement.textContent =
    data.id;

    orderStatusElement.textContent =
    data.status;

    totalAmountElement.textContent =
    formatMoney(data.total_amount);

    createdAtElement.textContent =
    new Date(
        data.created_at
    ).toLocaleString();

    paymentMethodElement.textContent =
    data.payment_method || "-";

    statusSelect.value =
    data.status;
}
async function loadCustomer(){

    const {data,error} =
    await supabaseClient
    .from("profiles")
    .select("full_name,email")
    .eq("id",currentOrder.user_id)
    .single();

    if(error){

        customerElement.textContent =
        currentOrder.user_id;

        return;

    }

    customerElement.textContent =
    `${data.full_name || "Unknown"} (${data.email})`;

}

async function loadItems(){

    const {data,error} =
    await supabaseClient
    .from("order_items")
    .select(`
        quantity,
        price,
        status,
        products(
            name
        ),
        inventory(
            username,
            password,
            recovery_email,
            recovery_password,
            notes,
            status
        )
    `)
    .eq("order_id",orderId);

    if(error){

        throw error;

    }

    if(!data || data.length===0){

        itemsContainer.innerHTML = `
        <p>
        No purchased items found.
        </p>`;

        return;

    }

    itemsContainer.innerHTML = "";

    data.forEach(item=>{

        const account =
        item.inventory || {};

        itemsContainer.innerHTML += `

        <div class="card">

            <div class="details-grid">

                <div>

                    <strong>

                    Product

                    </strong>

                    <p>

                    ${item.products?.name || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Quantity

                    </strong>

                    <p>

                    ${item.quantity}

                    </p>

                </div>

                <div>

                    <strong>

                    Price

                    </strong>

                    <p>

                    ${formatMoney(item.price)}

                    </p>

                </div>

                <div>

                    <strong>

                    Username

                    </strong>

                    <p>

                    ${account.username || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Password

                    </strong>

                    <p>

                    ${account.password || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Recovery Email

                    </strong>

                    <p>

                    ${account.recovery_email || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Recovery Password

                    </strong>

                    <p>

                    ${account.recovery_password || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Notes

                    </strong>

                    <p>

                    ${account.notes || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Inventory Status

                    </strong>

                    <p>

                    ${account.status || "-"}

                    </p>

                </div>

            </div>

        </div>

        `;

    });

      }
async function updateOrderStatus(){

    saveStatusBtn.disabled = true;

    saveStatusBtn.textContent =
    "Saving...";

    try{

        const {error} =
        await supabaseClient
        .from("orders")
        .update({

            status:
            statusSelect.value

        })
        .eq(
            "id",
            orderId
        );

        if(error){

            throw error;

        }

        orderStatusElement.textContent =
        statusSelect.value;

        alert(
            "Order status updated successfully."
        );

    }catch(error){

        console.error(error);

        alert(
            error.message
        );

    }finally{

        saveStatusBtn.disabled = false;

        saveStatusBtn.textContent =
        "Save Changes";

    }

}

saveStatusBtn.addEventListener(
"click",
updateOrderStatus
);

async function init(){

    try{

        const admin =
        await checkAdmin();

        if(!admin){

            return;

        }

        if(!orderId){

            alert(
                "Order ID is missing."
            );

            window.location.href =
            "orders.html";

            return;

        }

        await loadOrder();

        await loadCustomer();

        await loadItems();

    }catch(error){

        console.error(error);

        alert(
            "Failed to load order details."
        );

        itemsContainer.innerHTML = `
            <p>
                Failed to load order.
            </p>
        `;

    }

}

init();
