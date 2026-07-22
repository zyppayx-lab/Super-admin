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

const image1 =
document.getElementById("image1");

const image2 =
document.getElementById("image2");

const preview1 =
document.getElementById("preview1");

const preview2 =
document.getElementById("preview2");

const saveButton =
document.querySelector(".save-btn");

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

async function loadCategories(){

    try{

        const {data,error} =
        await supabaseClient
        .from("categories")
        .select("id,name")
        .order("name");

        if(error){

            throw error;

        }

        categorySelect.innerHTML = `
        <option value="">
            Select Category
        </option>`;

        data.forEach(category=>{

            categorySelect.innerHTML += `

            <option value="${category.id}">

                ${category.name}

            </option>

            `;

        });

    }catch(error){

        console.error(error);

        alert("Failed to load categories.");

    }

}

function previewImage(input,image){

    const file =
    input.files[0];

    if(!file){

        return;

    }

    image.src =
    URL.createObjectURL(file);

}

image1.addEventListener(
    "change",
    ()=>previewImage(image1,preview1)
);

image2.addEventListener(
    "change",
    ()=>previewImage(image2,preview2)
);

async function uploadImage(file,path){

    if(!file){

        return null;

    }

    const {error} =
    await supabaseClient
    .storage
    .from("product-images")
    .upload(
        path,
        file,
        {
            upsert:true
        }
    );

    if(error){

        throw error;

    }

    const {data} =
    supabaseClient
    .storage
    .from("product-images")
    .getPublicUrl(path);

    return data.publicUrl;

}
productForm.addEventListener(
"submit",
async(event)=>{

    event.preventDefault();

    saveButton.disabled = true;
    saveButton.textContent =
    "Creating Product...";

    try{

        const imagePath1 =
        `products/${Date.now()}_1_${
            image1.files[0].name
        }`;

        const imagePath2 =
        image2.files[0]
        ? `products/${Date.now()}_2_${
            image2.files[0].name
        }`
        : null;

        const imageUrl1 =
        await uploadImage(
            image1.files[0],
            imagePath1
        );

        const imageUrl2 =
        image2.files[0]
        ? await uploadImage(
            image2.files[0],
            imagePath2
        )
        : null;

        const {error} =
        await supabaseClient
        .from("products")
        .insert({

            category_id:
            categorySelect.value,

            name:
            document.getElementById("name").value,

            description:
            document.getElementById("description").value,

            price:
            Number(
                document.getElementById("price").value
            ),

            country:
            document.getElementById("country").value,

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

        alert(
            error.message ||
            "Failed to create product."
        );

    }finally{

        saveButton.disabled = false;

        saveButton.textContent =
        "Create Product";

    }

});

async function init(){

    const admin =
    await checkAdmin();

    if(!admin){
        return;
    }

    await loadCategories();

}

init();
