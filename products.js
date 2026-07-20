// ===============================
// Supabase
// ===============================

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ===============================
// Elements
// ===============================

const productsContainer =
document.getElementById("productsContainer");

const productModal =
document.getElementById("productModal");

const productForm =
document.getElementById("productForm");

const addProductBtn =
document.getElementById("addProductBtn");

const closeModal =
document.getElementById("closeModal");

const categorySelect =
document.getElementById("category");

const searchInput =
document.getElementById("searchInput");

const logoutBtn =
document.getElementById("logoutBtn");

let allProducts = [];


// ===============================
// Start
// ===============================

document.addEventListener(
"DOMContentLoaded",
async ()=>{

    const access =
    await checkAdminAccess();

    if(!access){
        return;
    }

    addProductBtn.onclick = ()=>{
        productModal.style.display = "flex";
    };

    closeModal.onclick = ()=>{
        productModal.style.display = "none";
        productForm.reset();
    };

    logoutBtn.onclick = ()=>{
        adminLogout();
    };

    await loadCategories();

    await loadProducts();

});
// ===============================
// Load Categories
// ===============================

async function loadCategories(){

    const { data, error } =
    await supabaseClient
    .from("categories")
    .select("id,name,platform")
    .order("platform");

    if(error){

        console.error(error);

        return;

    }

    categorySelect.innerHTML = `
        <option value="">
            Select Category
        </option>
    `;

    data.forEach(category=>{

        categorySelect.innerHTML += `
            <option value="${category.id}">
                ${category.platform} • ${category.name}
            </option>
        `;

    });

}



// ===============================
// Load Products
// ===============================

async function loadProducts(){

    const { data, error } =
    await supabaseClient
    .from("products")
    .select(`
        *,
        categories(
            name,
            platform
        )
    `)
    .order("created_at",{
        ascending:false
    });

    if(error){

        console.error(error);

        productsContainer.innerHTML = `
            <p>Failed to load products.</p>
        `;

        return;

    }

    allProducts = data;

    renderProducts(allProducts);

}



// ===============================
// Render Products
// ===============================

function renderProducts(products){

    productsContainer.innerHTML = "";

    if(products.length===0){

        productsContainer.innerHTML = `
            <p>No products found.</p>
        `;

        return;

    }

    products.forEach(product=>{

        productsContainer.innerHTML += `

        <div class="product-card">

            <h3>${product.name}</h3>

            <p>
                <strong>Platform:</strong>
                ${product.categories?.platform ?? "-"}
            </p>

            <p>
                <strong>Category:</strong>
                ${product.categories?.name ?? "-"}
            </p>

            <p>
                <strong>Price:</strong>
                ₦${Number(product.price).toLocaleString()}
            </p>

            <p>
                <strong>Country:</strong>
                ${product.country ?? "-"}
            </p>

            <p>
                <strong>Type:</strong>
                ${product.type}
            </p>

            <p>
                <strong>Stock:</strong>
                ${product.stock_type}
            </p>

            <span class="badge">
                ${product.status}
            </span>

            <div class="actions">

                <button
                    class="edit-btn"
                    data-id="${product.id}">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    data-id="${product.id}">
                    Delete
                </button>

            </div>

        </div>

        `;

    });

}
// ===============================
// Search Products
// ===============================

searchInput.addEventListener(
"input",
()=>{

    const keyword =
    searchInput.value
    .toLowerCase()
    .trim();

    const filtered =
    allProducts.filter(product=>{

        return (
            product.name.toLowerCase().includes(keyword) ||

            (product.categories?.platform || "")
            .toLowerCase()
            .includes(keyword) ||

            (product.categories?.name || "")
            .toLowerCase()
            .includes(keyword) ||

            (product.country || "")
            .toLowerCase()
            .includes(keyword)
        );

    });

    renderProducts(filtered);

});



// ===============================
// Create Product
// ===============================

productForm.addEventListener(
"submit",
async(e)=>{

    e.preventDefault();

    const session =
    await supabaseClient.auth.getSession();

    const adminId =
    session.data.session.user.id;

    const payload = {

        p_admin_id:
        adminId,

        p_category_id:
        categorySelect.value,

        p_name:
        document.getElementById("name").value.trim(),

        p_description:
        document.getElementById("description").value.trim(),

        p_price:
        Number(
            document.getElementById("price").value
        ),

        p_type:
        document.getElementById("type").value.trim(),

        p_stock_type:
        document.getElementById("stockType").value

    };



    const {
        data,
        error
    } =
    await supabaseClient.rpc(
        "admin_create_product",
        payload
    );



    if(error){

        alert(error.message);

        return;

    }



    alert("Product created successfully.");

    productModal.style.display =
    "none";

    productForm.reset();

    loadProducts();

});



// ===============================
// Close Modal
// ===============================

window.onclick =
(event)=>{

    if(
        event.target === productModal
    ){

        productModal.style.display =
        "none";

    }

};



// ===============================
// Delete Product
// ===============================

document.addEventListener(
"click",
async(event)=>{

    if(
        !event.target.classList.contains(
            "delete-btn"
        )
    ){
        return;
    }

    const id =
    event.target.dataset.id;

    if(
        !confirm(
            "Delete this product?"
        )
    ){
        return;
    }

    const {
        error
    } =
    await supabaseClient
    .from("products")
    .delete()
    .eq("id",id);

    if(error){

        alert(error.message);

        return;

    }

    loadProducts();

});



// ===============================
// Edit Product
// ===============================

document.addEventListener(
"click",
(event)=>{

    if(
        !event.target.classList.contains(
            "edit-btn"
        )
    ){
        return;
    }

    alert(
        "Edit product page will be implemented next."
    );

});
