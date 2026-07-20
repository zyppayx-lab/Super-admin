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
// Admin Security Check
// ===============================

async function checkAdminAccess(){


    const {
        data: {
            session
        }
    } =
    await supabaseClient.auth.getSession();



    // No login session

    if(!session){

        window.location.href =
        "index.html";

        return false;

    }




    const {
        data: profile,
        error
    } =
    await supabaseClient
    .from("profiles")
    .select(
        "role,email,full_name"
    )
    .eq(
        "id",
        session.user.id
    )
    .single();





    if(
        error ||
        !profile ||
        profile.role !== "admin"
    ){


        await supabaseClient.auth.signOut();


        window.location.href =
        "index.html";


        return false;


    }





    // Store admin details

    window.adminUser =
    {

        id: session.user.id,

        email: profile.email,

        name: profile.full_name

    };



    return true;


}



// ===============================
// Logout
// ===============================

async function adminLogout(){


    await supabaseClient.auth.signOut();


    window.location.href =
    "index.html";


      }
