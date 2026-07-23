const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const usersTable =
document.getElementById("usersTable");

const searchInput =
document.getElementById("searchInput");

const emptyState =
document.getElementById("emptyState");

let allUsers = [];

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

async function loadUsers(){

    const {data,error} =
    await supabaseClient
    .from("profiles")
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

    allUsers = data || [];

    renderUsers(allUsers);

}
function renderUsers(users){

    if(users.length===0){

        usersTable.innerHTML = `
        <tr>
            <td colspan="7" class="loading">
                No users found.
            </td>
        </tr>
        `;

        emptyState.style.display =
        "block";

        return;

    }

    emptyState.style.display =
    "none";

    usersTable.innerHTML = "";

    users.forEach(user=>{

        usersTable.innerHTML += `

        <tr>

            <td>

                ${user.full_name || "-"}

            </td>

            <td>

                ${user.email || "-"}

            </td>

            <td>

                ${formatMoney(
                    user.wallet_balance
                )}

            </td>

            <td>

                ${user.referral_code || "-"}

            </td>

            <td>

                ${user.role || "user"}

            </td>

            <td>

                ${new Date(
                    user.created_at
                ).toLocaleDateString()}

            </td>

            <td>

                <a
                href="user-details.html?id=${user.id}"
                class="view-btn">

                View

                </a>

            </td>

        </tr>

        `;

    });

}

function formatMoney(amount){

    return "₦" +
    Number(amount || 0)
    .toLocaleString();

}
searchInput.addEventListener(
"input",
function(){

    const query =
    this.value
    .trim()
    .toLowerCase();

    const filtered =
    allUsers.filter(user=>{

        const name =
        (user.full_name || "")
        .toLowerCase();

        const email =
        (user.email || "")
        .toLowerCase();

        return name.includes(query) ||
               email.includes(query);

    });

    renderUsers(filtered);

});

async function init(){

    try{

        const ok =
        await checkAdmin();

        if(!ok){

            return;

        }

        await loadUsers();

    }catch(error){

        console.error(error);

        usersTable.innerHTML = `

        <tr>

            <td
            colspan="7"
            class="loading">

            Failed to load users.

            </td>

        </tr>

        `;

    }

}

init();
