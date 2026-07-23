const SUPABASE_URL =
"https://dohxtukzxopwkvxeppdl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const productForm =
document.getElementById("productForm");

const categorySelect =
document.getElementById("category");

const platformInput =
document.getElementById("platform");

const typeInput =
document.getElementById("type");

const preview1 =
document.getElementById("preview1");

const preview2 =
document.getElementById("preview2");

const image1 =
document.getElementById("image1");

const image2 =
document.getElementById("image2");

const saveButton =
document.querySelector(".save-btn");

let categories = [];

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

async function loadCategories(){

    const {data,error} =
    await supabaseClient
    .from("categories")
    .select("*")
    .order("name");

    if(error){

        throw error;

    }

    categories = data;

    categorySelect.innerHTML =
    `<option value="">Select Category</option>`;

    data.forEach(category=>{

        categorySelect.innerHTML += `

        <option value="${category.id}">

            ${category.name}

        </option>

        `;

    });

}

categorySelect.addEventListener(
"change",
()=>{

    const category =
    categories.find(
        item=>item.id===categorySelect.value
    );

    if(!category){

        platformInput.value="";
        typeInput.value="";

        return;

    }

    platformInput.value =
    category.platform;

    typeInput.value =
    category.type;

});

function previewImage(fileInput,image){

    if(!fileInput.files.length){

        return;

    }

    image.src =
    URL.createObjectURL(
        fileInput.files[0]
    );

}

image1.addEventListener(
"change",
()=>previewImage(image1,preview1)
);

image2.addEventListener(
"change",
()=>previewImage(image2,preview2)
);
async function uploadImage(file){

    if(!file){

        return null;

    }

    const extension =
    file.name.split(".").pop();

    const fileName =
    `${crypto.randomUUID()}.${extension}`;

    const filePath =
    `products/${fileName}`;

    const {error} =
    await supabaseClient
    .storage
    .from("product-images")
    .upload(
        filePath,
        file,
        {
            upsert:false
        }
    );

    if(error){

        throw error;

    }

    const {data} =
    supabaseClient
    .storage
    .from("product-images")
    .getPublicUrl(filePath);

    return data.publicUrl;

}

productForm.addEventListener(
"submit",
async(event)=>{

    event.preventDefault();

    saveButton.disabled = true;

    saveButton.textContent =
    "Creating...";

    try{

        const imageUrl1 =
        await uploadImage(
            image1.files[0]
        );

        const imageUrl2 =
        image2.files.length
        ? await uploadImage(
            image2.files[0]
        )
        : null;

        const {error} =
        await supabaseClient
        .from("products")
        .insert({

            category_id:
            categorySelect.value,

            name:
            document.getElementById("name").value.trim(),

            description:
            document.getElementById("description").value.trim(),

            price:
            Number(
                document.getElementById("price").value
            ),

            country:
            document.getElementById("country").value.trim(),

            status:
            document.getElementById("status").value,

            stock_type:
            document.getElementById("stockType").value,

            image_url:
            imageUrl1,

            image_url_2:
            imageUrl2

        });

        if(error){

            throw error;

        }

        alert(
            "Product created successfully."
        );

        window.location.href =
        "products.html";

    }catch(error){

        console.error(error);

        alert(error.message);

    }finally{

        saveButton.disabled = false;

        saveButton.textContent =
        "Create Product";

    }

});

async function init(){

    try{

        const admin =
        await checkAdmin();

        if(!admin){

            return;

        }

        await loadCategories();

    }catch(error){

        console.error(error);

        alert(
            "Failed to initialize page."
        );

    }

}

init();
