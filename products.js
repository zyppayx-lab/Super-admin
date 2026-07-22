const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const productsGrid =
document.getElementById("productsGrid");

const searchInput =
document.getElementById("searchInput");

const platformFilter =
document.getElementById("platformFilter");

const countryFilter =
document.getElementById("countryFilter");

const template =
document.getElementById("productTemplate");

let products = [];

let filteredProducts = [];

const DEFAULT_IMAGE =
"https://placehold.co/600x400?text=No+Image";

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

        window.location.href =
        "../index.html";

        return null;

    }

    return data.user;

}

function formatMoney(amount){

    return "₦" +
    Number(amount || 0)
    .toLocaleString();

}

async function loadProducts(){

    try{

        const {data,error} =
        await supabaseClient
        .from("marketplace_products")
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

        products =
        data || [];

        filteredProducts =
        [...products];

        loadFilters();

        renderProducts();

    }catch(error){

        console.error(error);

        productsGrid.innerHTML = `

        <div class="empty">

            Failed to load products

        </div>

        `;

    }

}

function loadFilters(){

    platformFilter.innerHTML =

    `<option value="all">
    All Platforms
    </option>`;

    countryFilter.innerHTML =

    `<option value="all">
    All Countries
    </option>`;

    [...new Set(products.map(
        p=>p.platform
    ))]
    .forEach(platform=>{

        platformFilter.innerHTML += `

        <option value="${platform}">

            ${platform}

        </option>

        `;

    });

    [...new Set(products.map(
        p=>p.country
    ))]
    .forEach(country=>{

        countryFilter.innerHTML += `

        <option value="${country}">

            ${country}

        </option>

        `;

    });

}
function renderProducts(){

    if(filteredProducts.length===0){

        productsGrid.innerHTML = `

        <div class="empty">

            No products found

        </div>

        `;

        return;

    }

    productsGrid.innerHTML = "";

    filteredProducts.forEach(product=>{

        productsGrid.innerHTML += `

        <div class="product-card">

            <div class="product-images">

                <img
                    class="main-image"
                    src="${product.image_url || DEFAULT_IMAGE}"
                    alt="${product.name}"
                >

                <img
                    class="small-image"
                    src="${product.image_url_2 || product.image_url || DEFAULT_IMAGE}"
                    alt="${product.name}"
                >

            </div>

            <div class="product-content">

                <h3 class="product-name">

                    ${product.name}

                </h3>

                <p class="product-description">

                    ${product.description || ""}

                </p>

                <div class="product-details">

                    <div>
                        <strong>Platform:</strong>
                        ${product.platform}
                    </div>

                    <div>
                        <strong>Country:</strong>
                        ${product.country}
                    </div>

                    <div>
                        <strong>Category:</strong>
                        ${product.category}
                    </div>

                    <div>
                        <strong>Stock:</strong>
                        ${product.stock}
                    </div>

                    <div>
                        <strong>Status:</strong>

                        <span class="status">
                            ${product.status}
                        </span>
                    </div>

                </div>

                <div class="product-price">

                    ${formatMoney(product.price)}

                </div>

                <div class="product-actions">

                    <button
                        class="edit-btn"
                        onclick="editProduct('${product.id}')">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct('${product.id}')">

                        Delete

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

function applyFilters(){

    const search =
    searchInput.value.toLowerCase();

    const platform =
    platformFilter.value;

    const country =
    countryFilter.value;

    filteredProducts =
    products.filter(product=>{

        const matchSearch =
            product.name.toLowerCase().includes(search) ||
            (product.description || "")
            .toLowerCase()
            .includes(search);

        const matchPlatform =
            platform==="all" ||
            product.platform===platform;

        const matchCountry =
            country==="all" ||
            product.country===country;

        return (
            matchSearch &&
            matchPlatform &&
            matchCountry
        );

    });

    renderProducts();

}

function editProduct(id){

    window.location.href =
    `edit-product.html?id=${id}`;

}

async function deleteProduct(id){

    if(!confirm(
        "Delete this product?"
    )){
        return;
    }

    try{

        const {error} =
        await supabaseClient
        .from("products")
        .delete()
        .eq("id",id);

        if(error){

            throw error;

        }

        await loadProducts();

        alert(
            "Product deleted successfully."
        );

    }catch(error){

        console.error(error);

        alert(
            "Failed to delete product."
        );

    }

}

searchInput.addEventListener(
    "input",
    applyFilters
);

platformFilter.addEventListener(
    "change",
    applyFilters
);

countryFilter.addEventListener(
    "change",
    applyFilters
);

async function init(){

    const user =
    await checkAdmin();

    if(!user){
        return;
    }

    await loadProducts();

}

init();
