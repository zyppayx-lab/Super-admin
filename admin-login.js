// ==============================
// Supabase
// ==============================

const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==============================
// Elements
// ==============================

const form = document.getElementById("adminLoginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const loginText = document.getElementById("loginText");
const loginLoader = document.getElementById("loginLoader");

const togglePassword = document.getElementById("togglePassword");

const errorMessage = document.getElementById("errorMessage");


// ==============================
// Helpers
// ==============================

function showError(message) {

    errorMessage.style.display = "block";
    errorMessage.textContent = message;

}

function hideError() {

    errorMessage.style.display = "none";
    errorMessage.textContent = "";

}

function setLoading(loading) {

    loginBtn.disabled = loading;

    loginText.style.display =
        loading ? "none" : "inline";

    loginLoader.style.display =
        loading ? "inline-block" : "none";

}


// ==============================
// Toggle Password
// ==============================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "👁";

    }

});


// ==============================
// Existing Session Check
// ==============================

async function checkSession() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) return;

    const { data: isAdmin } =
        await supabase.rpc("is_admin", {

            p_user_id: session.user.id

        });

    if (!isAdmin) {

        await supabase.auth.signOut();

        window.location.replace("admin-login.html");

        return;

    }

    window.location.replace("admin.html");

}


// ==============================
// Start
// ==============================

checkSession();
// ==============================
// Login
// ==============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    hideError();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    if (!email || !password) {

        showError("Please enter your email and password.");

        return;

    }

    setLoading(true);

    try {

        const {

            data,
            error

        } = await supabase.auth.signInWithPassword({

            email,
            password

        });

        if (error) {

            showError("Invalid email or password.");

            setLoading(false);

            return;

        }

        const session = data.session;

        if (!session) {

            showError("Unable to create session.");

            setLoading(false);

            return;

        }

        const {

            data: isAdmin,
            error: adminError

        } = await supabase.rpc(

            "is_admin",

            {

                p_user_id: session.user.id

            }

        );

        if (adminError) {

            await supabase.auth.signOut();

            showError("Unable to verify administrator.");

            setLoading(false);

            return;

        }

        if (!isAdmin) {

            await supabase.auth.signOut();

            showError("Access denied.");

            setLoading(false);

            return;

        }

        window.location.replace("admin.html");

    } catch (err) {

        console.error(err);

        showError("Something went wrong. Please try again.");

    } finally {

        setLoading(false);

    }

});
// ==============================
// Auth State Listener
// ==============================

supabase.auth.onAuthStateChange(async (event, session) => {

    if (event === "SIGNED_OUT") {

        window.location.replace("admin-login.html");
        return;

    }

    if (event === "TOKEN_REFRESHED") {

        if (!session) {

            window.location.replace("admin-login.html");
            return;

        }

        const { data: isAdmin } = await supabase.rpc(
            "is_admin",
            {
                p_user_id: session.user.id
            }
        );

        if (!isAdmin) {

            await supabase.auth.signOut();

            window.location.replace("admin-login.html");

            return;

        }

    }

});


// ==============================
// Enter Key Support
// ==============================

emailInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        passwordInput.focus();

    }

});

passwordInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        form.requestSubmit();

    }

});


// ==============================
// Prevent Multiple Clicks
// ==============================

loginBtn.addEventListener("dblclick", (e) => {

    e.preventDefault();

});


// ==============================
// Clear Error While Typing
// ==============================

emailInput.addEventListener("input", hideError);
passwordInput.addEventListener("input", hideError);
