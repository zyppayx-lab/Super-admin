// ===============================
// Supabase Configuration
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

const loginForm =
document.getElementById("loginForm");


const emailInput =
document.getElementById("email");


const passwordInput =
document.getElementById("password");


const loginBtn =
document.getElementById("loginBtn");


const message =
document.getElementById("message");




// ===============================
// Login
// ===============================

loginForm.addEventListener(
"submit",
async (e)=>{


    e.preventDefault();



    const email =
    emailInput.value.trim();


    const password =
    passwordInput.value;



    message.textContent =
    "Checking credentials...";


    loginBtn.disabled = true;


    try{


        // Login with Supabase Auth

        const {
            data,
            error
        } =
        await supabaseClient.auth.signInWithPassword({

            email,
            password

        });



        if(error){

            throw error;

        }



        const user =
        data.user;



        if(!user){

            throw new Error(
                "Login failed."
            );

        }




        // Get profile role

        const {
            data: profile,
            error: profileError
        } =
        await supabaseClient
        .from("profiles")
        .select("role")
        .eq(
            "id",
            user.id
        )
        .single();



        if(profileError){

            throw profileError;

        }




        // Admin check

        if(
            profile.role !== "admin"
        ){

            await supabaseClient.auth.signOut();


            throw new Error(
                "Access denied. Admin only."
            );

        }




        message.textContent =
        "Login successful...";


        window.location.href =
        "dashboard.html";



    }
    catch(error){


        console.error(
            error
        );


        message.textContent =
        error.message ||
        "Something went wrong.";



    }
    finally{


        loginBtn.disabled =
        false;


    }


});
