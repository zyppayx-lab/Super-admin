// ===============================
// Supabase Configuration
// ===============================

const SUPABASE_URL = "https://dohxtukzxopwkvxeppdl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KHU_8oYCtAgiBkWM_ShXmw_nO7FKnG7";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ===============================
// Elements
// ===============================

const loginForm = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const loginText = document.getElementById("loginText");
const loginLoader = document.getElementById("loginLoader");

const togglePassword = document.getElementById("togglePassword");
const errorMessage = document.getElementById("errorMessage");

// ===============================
// Password Toggle
// ===============================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "👁";

    }

});

// ===============================
// UI Helpers
// ===============================

function showError(message) {

    errorMessage.style.display = "block";
    errorMessage.textContent = message;

}

function hideError() {

    errorMessage.style.display = "none";
    errorMessage.textContent = "";

}

function setLoading(state) {

    loginBtn.disabled = state;

    if (state) {

        loginText.style.display = "none";
        loginLoader.style.display = "inline-block";

    } else {

        loginText.style.display = "inline";
        loginLoader.style.display = "none";

    }

}

// ===============================
// Redirect if already logged in
// ===============================

(async () => {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) return;

    const {
        data: isAdmin,
        error
    } = await supabase.rpc("is_admin", {
        p_user_id: session.user.id
    });

    if (!error && isAdmin === true) {

        window.location.replace("admin.html");

    }

})();
// ===============================
// Admin Login
// ===============================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showError("Please enter your email and password.");
        return;
    }

    setLoading(true);

    try {

        // Login
        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({

            email,
            password

        });

        if (error) {

            showError(error.message);
            return;

        }

        const user = data.user;

        // Verify admin role
        const {
            data: isAdmin,
            error: adminError
        } = await supabase.rpc("is_admin", {

            p_user_id: user.id

        });

        if (adminError) {

            await supabase.auth.signOut();

            showError("Unable to verify administrator.");

            return;

        }

        if (!isAdmin) {

            await supabase.auth.signOut();

            showError("Access denied. Administrator account required.");

            return;

        }

        window.location.replace("admin.html");

    } catch (err) {

        showError(
            err.message || "Unexpected error occurred."
        );

    } finally {

        setLoading(false);

    }

});


// ===============================
// Session Listener
// ===============================

supabase.auth.onAuthStateChange((event) => {

    if (event === "SIGNED_OUT") {

        window.location.replace("admin-login.html");

    }

});
