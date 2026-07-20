"use strict";

// ===============================
// Supabase
// ===============================

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ===============================
// Elements
// ===============================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");
const togglePassword = document.getElementById("togglePassword");

// ===============================
// Helpers
// ===============================

function showMessage(text, type = "error") {

    message.className = `message ${type}`;
    message.textContent = text;

}

function clearMessage() {

    message.className = "message";
    message.textContent = "";

}

function setLoading(state) {

    loginBtn.disabled = state;

    loginBtn.textContent = state
        ? "Signing in..."
        : "Login";

}

// ===============================
// Password Toggle
// ===============================

togglePassword.addEventListener("click", () => {

    passwordInput.type =
        passwordInput.type === "password"
            ? "text"
            : "password";

});

// ===============================
// Already Logged In?
// ===============================

async function checkExistingSession() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) return;

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (profile?.role === "admin") {

        window.location.replace("admin.html");
        return;

    }

    await supabase.auth.signOut();

}

checkExistingSession();

// ===============================
// Login
// ===============================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    clearMessage();

    setLoading(true);

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    const {

        data,
        error

    } = await supabase.auth.signInWithPassword({

        email,
        password

    });

    if (error) {

        setLoading(false);

        showMessage(error.message);

        return;

    }

    const { data: profile, error: profileError } =
        await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

    if (profileError || !profile) {

        await supabase.auth.signOut();

        setLoading(false);

        showMessage("Unable to verify administrator.");

        return;

    }

    if (profile.role !== "admin") {

        await supabase.auth.signOut();

        setLoading(false);

        showMessage("Access denied. Administrator account required.");

        return;

    }

    showMessage(
        "Login successful...",
        "success"
    );

    setTimeout(() => {

        window.location.replace("admin.html");

    }, 700);

});
