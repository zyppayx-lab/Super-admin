const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const productId =
new URLSearchParams(
    window.location.search
).get("product");

const productName =
document.getElementById("productName");

const productInfo =
document.getElementById("productInfo");

const form =
document.getElementById("inventoryForm");

const saveBtn =
document.querySelector(".save-btn");

async function checkAdmin(){

    const {data,error} =
    await supabaseClient.auth.getUser();

    if(error || !data.user){

        window.location.href="../login.html";
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

        window.location.href="../index.html";

        return null;

    }

    return data.user;

}

async function loadProduct(){

    if(!productId){

        alert("Product not found.");

        window.location.href="products.html";

        return;

    }

    const {data,error} =
    await supabaseClient
    .from("products")
    .select(`
        name,
        country,
        price
    `)
    .eq("id",productId)
    .single();

    if(error){

        throw error;

    }

    productName.textContent =
    data.name;

    productInfo.innerHTML = `
        Country: ${data.country}<br>
        Price: ₦${Number(data.price).toLocaleString()}
    `;

}
form.addEventListener(
"submit",
async(e)=>{

    e.preventDefault();

    saveBtn.disabled = true;

    saveBtn.textContent =
    "Saving...";

    try{

        const {error} =
        await supabaseClient
        .from("inventory")
        .insert({

            product_id:
            productId,

            username:
            document
            .getElementById("username")
            .value
            .trim(),

            password:
            document
            .getElementById("password")
            .value
            .trim(),

            recovery_email:
            document
            .getElementById("recoveryEmail")
            .value
            .trim() || null,

            recovery_password:
            document
            .getElementById("recoveryPassword")
            .value
            .trim() || null,

            notes:
            document
            .getElementById("notes")
            .value
            .trim() || null,

            status:
            document
            .getElementById("status")
            .value,

            is_sold:false

        });

        if(error){

            throw error;

        }

        alert(
            "Inventory added successfully."
        );

        window.location.href =
        "products.html";

    }catch(error){

        console.error(error);

        alert(error.message);

    }finally{

        saveBtn.disabled = false;

        saveBtn.textContent =
        "Save Credentials";

    }

});

async function init(){

    try{

        const admin =
        await checkAdmin();

        if(!admin){

            return;

        }

        await loadProduct();

    }catch(error){

        console.error(error);

        alert(
            "Failed to load page."
        );

    }

}

init();
