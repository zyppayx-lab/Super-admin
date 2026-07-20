// ===============================
// Supabase
// ===============================

const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvaHh0dWt6eG9wd2t2eGVwcGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTA5NzksImV4cCI6MjA5ODc2Njk3OX0.EvzBxG--UmAIDL6dX-cU878tjRRHacazKv9mbEsGgWY";

const supabaseClient =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ===============================
// Elements
// ===============================

const productsBody =
document.getElementById("productsBody");

const categoryFilter =
document.getElementById("categoryFilter");

const categorySelect =
document.getElementById("category");

const searchInput =
document.getElementById("searchInput");

const refreshBtn =
document.getElementById("refreshBtn");

const addProductBtn =
document.getElementById("addProductBtn");

const productModal =
document.getElementById("productModal");

const cancelBtn =
document.getElementById("cancelBtn");

const productForm =
document.getElementById("productForm");

const messageBox =
document.getElementById("messageBox");


// ===============================
// Variables
// ===============================

let adminUser = null;

let allProducts = [];

let allCategories = [];

let editingProductId = null;


// ===============================
// Initialize
// ===============================

document.addEventListener(
"DOMContentLoaded",
async ()=>{

    const allowed =
    await checkAdminAccess();

    if(!allowed){
        return;
    }

    adminUser =
    window.adminUser;

    await loadCategories();

    await loadProducts();

});
// ===============================
// Load Categories
// ===============================

async function loadCategories(){

    try{

        const {
            data,
            error
        } =
        await supabaseClient
        .from("categories")
        .select("*")
        .order("name");

        if(error){
            throw error;
        }

        allCategories = data || [];

        categoryFilter.innerHTML =
        '<option value="">All Categories</option>';

        categorySelect.innerHTML =
        '<option value="">Select Category</option>';

        allCategories.forEach(category=>{

            categoryFilter.innerHTML += `
                <option value="${category.id}">
                    ${category.name}
                </option>
            `;

            categorySelect.innerHTML += `
                <option value="${category.id}">
                    ${category.name}
                </option>
            `;

        });

    }
    catch(error){

        showMessage(
            error.message,
            "error"
        );

    }

}



// ===============================
// Load Products
// ===============================

async function loadProducts(){

    try{

        productsBody.innerHTML = `

        <tr>

            <td colspan="7">

                Loading products...

            </td>

        </tr>

        `;

        const {
            data,
            error
        } =
        await supabaseClient
        .from("marketplace_products")
        .select("*")
        .order("created_at",{
            ascending:false
        });

        if(error){
            throw error;
        }

        allProducts = data || [];

        renderProducts(
            allProducts
        );

    }
    catch(error){

        productsBody.innerHTML = `

        <tr>

            <td colspan="7">

                Failed to load products.

            </td>

        </tr>

        `;

        showMessage(
            error.message,
            "error"
        );

    }

}
// ===============================
// Render Products
// ===============================

function renderProducts(products){

    if(products.length === 0){

        productsBody.innerHTML = `
        <tr>
            <td colspan="7">
                No products found.
            </td>
        </tr>
        `;

        return;

    }

    productsBody.innerHTML = "";

    products.forEach(product=>{

        const tr =
        document.createElement("tr");

        tr.innerHTML = `

        <td>${product.name}</td>

        <td>${product.category_name ?? "-"}</td>

        <td>₦${Number(product.price).toLocaleString()}</td>

        <td>${product.type}</td>

        <td>${product.stock_type}</td>

        <td>

            <span class="${
                product.status === "active"
                ? "status-active"
                : "status-inactive"
            }">

                ${product.status}

            </span>

        </td>

        <td>

            <button
                class="action-btn edit-btn"
                onclick="editProduct('${product.id}')">

                Edit

            </button>

            <button
                class="action-btn delete-btn"
                onclick="deleteProduct('${product.id}')">

                Delete

            </button>

        </td>

        `;

        productsBody.appendChild(tr);

    });

}



// ===============================
// Search
// ===============================

searchInput.addEventListener(
"input",
()=>{

    filterProducts();

});



// ===============================
// Category Filter
// ===============================

categoryFilter.addEventListener(
"change",
()=>{

    filterProducts();

});



// ===============================
// Filter Logic
// ===============================

function filterProducts(){

    const keyword =
    searchInput.value
    .toLowerCase()
    .trim();

    const category =
    categoryFilter.value;

    const filtered =
    allProducts.filter(product=>{

        const matchesSearch =

            product.name
            .toLowerCase()
            .includes(keyword);

        const matchesCategory =

            !category ||

            product.category_id === category;

        return (
            matchesSearch &&
            matchesCategory
        );

    });

    renderProducts(filtered);

}



// ===============================
// Buttons
// ===============================

refreshBtn.onclick = ()=>{

    loadProducts();

};



addProductBtn.onclick = ()=>{

    editingProductId = null;

    productForm.reset();

    document
    .getElementById("modalTitle")
    .textContent =
    "Add Product";

    productModal.classList.remove(
        "hidden"
    );

};



cancelBtn.onclick = ()=>{

    productModal.classList.add(
        "hidden"
    );

};



// ===============================
// Placeholders
// ===============================

function editProduct(id){

    editingProductId = id;

    alert(
        "Edit Product will be implemented in Part 4."
    );

}



function deleteProduct(id){

    alert(
        "Delete Product will be implemented in Part 4."
    );

}
// ===============================
// Save Product
// ===============================

productForm.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    try{

        const payload = {

            p_admin_id: adminUser.id,

            p_category_id:
            document.getElementById("category").value,

            p_name:
            document.getElementById("name").value.trim(),

            p_description:
            document.getElementById("description").value.trim(),

            p_price:
            Number(
                document.getElementById("price").value
            ),

            p_type:
            document.getElementById("type").value,

            p_stock_type:
            document.getElementById("stockType").value

        };


        if(editingProductId){

            const { error } =
            await supabaseClient
            .from("products")
            .update({

                category_id: payload.p_category_id,
                name: payload.p_name,
                description: payload.p_description,
                price: payload.p_price,
                type: payload.p_type,
                stock_type: payload.p_stock_type

            })
            .eq("id", editingProductId);

            if(error) throw error;

            showMessage(
                "Product updated successfully.",
                "success"
            );

        }else{

            const { error } =
            await supabaseClient.rpc(
                "admin_create_product",
                payload
            );

            if(error) throw error;

            showMessage(
                "Product created successfully.",
                "success"
            );

        }

        productModal.classList.add("hidden");

        productForm.reset();

        editingProductId = null;

        loadProducts();

    }
    catch(error){

        showMessage(
            error.message,
            "error"
        );

    }

});



// ===============================
// Edit Product
// ===============================

function editProduct(id){

    const product =
    allProducts.find(
        p=>p.id===id
    );

    if(!product){
        return;
    }

    editingProductId = id;

    document.getElementById("modalTitle").textContent =
    "Edit Product";

    document.getElementById("category").value =
    product.category_id;

    document.getElementById("name").value =
    product.name;

    document.getElementById("description").value =
    product.description || "";

    document.getElementById("price").value =
    product.price;

    document.getElementById("type").value =
    product.type;

    document.getElementById("stockType").value =
    product.stock_type;

    productModal.classList.remove(
        "hidden"
    );

}



// ===============================
// Delete Product
// ===============================

async function deleteProduct(id){

    if(
        !confirm(
            "Delete this product?"
        )
    ){
        return;
    }

    try{

        const { error } =
        await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

        if(error){
            throw error;
        }

        showMessage(
            "Product deleted successfully.",
            "success"
        );

        loadProducts();

    }
    catch(error){

        showMessage(
            error.message,
            "error"
        );

    }

}



// ===============================
// Message Helper
// ===============================

function showMessage(
message,
type
){

    messageBox.innerHTML =

    `<div class="${type}">
        ${message}
    </div>`;

    setTimeout(()=>{

        messageBox.innerHTML="";

    },3000);

            }
