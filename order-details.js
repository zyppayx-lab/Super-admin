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

const customerElement =
document.getElementById("customer");

const customerEmailElement =
document.getElementById("customerEmail");

const orderStatusElement =
document.getElementById("orderStatus");

const paymentMethodElement =
document.getElementById("paymentMethod");

const totalAmountElement =
document.getElementById("totalAmount");

const createdAtElement =
document.getElementById("createdAt");

const itemsContainer =
document.getElementById("itemsContainer");

const statusSelect =
document.getElementById("statusSelect");

const saveStatusBtn =
document.getElementById("saveStatusBtn");

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

async function loadOrder(){

    const {data,error} =
    await supabaseClient
    .from("admin_order_details_view")
    .select("*")
    .eq(
        "order_id",
        orderId
    );

    if(error){

        throw error;

    }

    if(!data || data.length===0){

        throw new Error(
            "Order not found."
        );

    }

    const order =
    data[0];

    orderIdElement.textContent =
    order.order_id;

    customerElement.textContent =
    order.customer_name || "-";

    customerEmailElement.textContent =
    order.customer_email || "-";

    orderStatusElement.textContent =
    order.order_status;

    paymentMethodElement.textContent =
    order.payment_method || "-";

    totalAmountElement.textContent =
    formatMoney(
        order.total_amount
    );

    createdAtElement.textContent =
    new Date(
        order.created_at
    ).toLocaleString();

    statusSelect.value =
    order.order_status;

    renderItems(data);

}
function renderItems(items){

    itemsContainer.innerHTML = "";

    items.forEach(item=>{

        itemsContainer.innerHTML += `

        <div class="item-card">

            <h3>

            ${item.product_name}

            </h3>

            <div class="details-grid">

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

                    Country

                    </strong>

                    <p>

                    ${item.country || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Product Status

                    </strong>

                    <p>

                    ${item.product_status}

                    </p>

                </div>

                <div>

                    <strong>

                    Username / Email

                    </strong>

                    <p>

                    ${item.username || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Password

                    </strong>

                    <p>

                    ${item.password || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Recovery Email

                    </strong>

                    <p>

                    ${item.recovery_email || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Recovery Password

                    </strong>

                    <p>

                    ${item.recovery_password || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Inventory Status

                    </strong>

                    <p>

                    ${item.inventory_status || "-"}

                    </p>

                </div>

                <div>

                    <strong>

                    Notes

                    </strong>

                    <p>

                    ${item.notes || "-"}

                    </p>

                </div>

            </div>

        </div>

        `;

    });

}

async function updateStatus(){

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
            "Order updated successfully."
        );

    }catch(error){

        console.error(error);

        alert(error.message);

    }finally{

        saveStatusBtn.disabled = false;

        saveStatusBtn.textContent =
        "Save Changes";

    }

}

saveStatusBtn.addEventListener(
"click",
updateStatus
);

async function init(){

    try{

        const ok =
        await checkAdmin();

        if(!ok){

            return;

        }

        if(!orderId){

            alert(
                "Missing order ID."
            );

            window.location.href =
            "orders.html";

            return;

        }

        await loadOrder();

    }catch(error){

        console.error(error);

        itemsContainer.innerHTML = `

        <div class="empty">

        Failed to load order details.

        </div>

        `;

    }

}

init();
