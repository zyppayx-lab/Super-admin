// ======================================
// Supabase
// ======================================

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaHh0dWt6eG9wd2t2eGVwcGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTA5NzksImV4cCI6MjA5ODc2Njk3OX0.EvzBxG--UmAIDL6dX-cU878tjRRHacazKv9mbEsGgWY";

const supabaseClient =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ======================================
// Elements
// ======================================

const table =
document.getElementById("productsTable");

const modal =
document.getElementById("productModal");

const addBtn =
document.getElementById("addProductBtn");

const closeBtn =
document.getElementById("closeModal");

const form =
document.getElementById("productForm");

const categorySelect =
document.getElementById("category");

const searchInput =
document.getElementById("searchInput");

// ======================================
// Variables
// ======================================

let adminId = null;

let allProducts = [];

let categories = [];

// ======================================
// Initialize
// ======================================

document.addEventListener(
"DOMContentLoaded",
async()=>{

    const allowed =
    await checkAdminAccess();

    if(!allowed){
        return;
    }

    adminId =
    window.adminUser.id;

    await loadCategories();

    await loadProducts();

});
// ======================================
// Load Categories
// ======================================

async function loadCategories(){

    const {
        data,
        error
    } =
    await supabaseClient
    .from("categories")
    .select("id,name,platform")
    .order("platform")
    .order("name");



    if(error){

        console.error(error);

        alert(
            error.message
        );

        return;

    }



    categories = data || [];



    categorySelect.innerHTML =

    `<option value="">
        Select Category
    </option>`;



    categories.forEach(category=>{

        categorySelect.innerHTML += `

        <option value="${category.id}">

            ${category.platform}
            -
            ${category.name}

        </option>

        `;

    });

}
// ======================================
// Load Products
// ======================================

async function loadProducts(){

    const {
        data,
        error
    } =
    await supabaseClient
    .from("available_products")
    .select("*")
    .order("created_at",{
        ascending:false
    });




    if(error){

        console.error(error);

        alert(error.message);

        return;

    }




    allProducts =
    data || [];



    renderProducts(
        allProducts
    );

}





// ======================================
// Render Products
// ======================================

function renderProducts(products){

    table.innerHTML = "";



    if(products.length===0){

        table.innerHTML =

        `

        <tr>

        <td colspan="8">

        No products found.

        </td>

        </tr>

        `;

        return;

    }




    products.forEach(product=>{


        table.innerHTML += `

<tr>

<td>

${product.name}

</td>

<td>

${product.platform}

</td>

<td>

${product.category}

</td>

<td>

${product.country}

</td>

<td>

₦${Number(product.price).toLocaleString()}

</td>

<td>

${product.stock}

</td>

<td>

<span class="status active">

Available

</span>

</td>

<td>

<button
class="action-btn edit-btn"
data-id="${product.id}">

Edit

</button>

<button
class="action-btn delete-btn"
data-id="${product.id}">

Delete

</button>

</td>

</tr>

`;

    });




    bindActionButtons();

}
// ======================================
// Search
// ======================================

searchInput.addEventListener("input",()=>{

    const keyword =
    searchInput.value
    .toLowerCase()
    .trim();

    const filtered =
    allProducts.filter(product=>

        product.name
        .toLowerCase()
        .includes(keyword)

        ||

        product.platform
        .toLowerCase()
        .includes(keyword)

        ||

        product.category
        .toLowerCase()
        .includes(keyword)

        ||

        product.country
        .toLowerCase()
        .includes(keyword)

    );

    renderProducts(filtered);

});



// ======================================
// Modal
// ======================================

addBtn.onclick=()=>{

    form.reset();

    form.dataset.mode="create";

    modal.style.display="flex";

};


closeBtn.onclick=()=>{

    modal.style.display="none";

};


window.onclick=(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

};



// ======================================
// Create Product
// ======================================

form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    const payload={

        p_admin_id:adminId,

        p_category_id:category.value,

        p_name:name.value,

        p_description:description.value,

        p_price:Number(price.value),

        p_type:type.value,

        p_stock_type:stockType.value

    };



    const {error}=

    await supabaseClient.rpc(

        "admin_create_product",

        payload

    );



    if(error){

        alert(error.message);

        return;

    }



    modal.style.display="none";

    form.reset();

    await loadProducts();

    alert("Product created successfully.");

});



// ======================================
// Edit / Delete
// ======================================

function bindActionButtons(){

    document
    .querySelectorAll(".delete-btn")
    .forEach(btn=>{

        btn.onclick=async()=>{

            if(!confirm("Delete this product?")){

                return;

            }

            const {error}=

            await supabaseClient

            .from("products")

            .delete()

            .eq("id",btn.dataset.id);

            if(error){

                alert(error.message);

                return;

            }

            await loadProducts();

        };

    });



    document
    .querySelectorAll(".edit-btn")
    .forEach(btn=>{

        btn.onclick=()=>{

            window.location.href=
            `edit-product.html?id=${btn.dataset.id}`;

        };

    });

}



// ======================================
// Logout
// ======================================

document
.getElementById("logoutBtn")
.onclick=()=>{

    adminLogout();

};
