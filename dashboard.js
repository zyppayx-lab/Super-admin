// ===============================
// Dashboard Logic
// ===============================


// Wait for admin verification

document.addEventListener(
"DOMContentLoaded",
async ()=>{


    const access =
    await checkAdminAccess();


    if(!access){

        return;

    }



    loadDashboard();



    document
    .getElementById("logoutBtn")
    .addEventListener(
    "click",
    ()=>{

        adminLogout();

    });



});





// ===============================
// Load Dashboard Data
// ===============================

async function loadDashboard(){


    try{


        document
        .getElementById("welcomeText")
        .textContent =
        `Welcome ${window.adminUser.name || window.adminUser.email}`;





        const users =
        await getCount("profiles");



        const products =
        await getCount("products");



        const inventory =
        await getCount("inventory");



        const orders =
        await getCount("orders");





        document
        .getElementById("usersCount")
        .textContent =
        users;



        document
        .getElementById("productsCount")
        .textContent =
        products;



        document
        .getElementById("inventoryCount")
        .textContent =
        inventory;



        document
        .getElementById("ordersCount")
        .textContent =
        orders;



    }
    catch(error){


        console.error(
            "Dashboard error:",
            error
        );


    }


}






// ===============================
// Count Helper
// ===============================

async function getCount(table){


    const {
        count,
        error
    } =
    await supabaseClient
    .from(table)
    .select(
        "*",
        {
            count:"exact",
            head:true
        }
    );



    if(error){

        throw error;

    }



    return count || 0;


}
