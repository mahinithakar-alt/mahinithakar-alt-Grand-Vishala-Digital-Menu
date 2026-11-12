/* =========================================================
   The Grand Vishala — Module 01: Login & Sign Up
   auth.js  |  Client-side validation and UI behaviour

   IMPORTANT: This is frontend validation for user experience only.
   It does NOT make authentication secure. Real authentication,
   password hashing, sessions and server-side validation must be
   built in the backend phase.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. Validation rules (pure functions, reusable anywhere)
     Each returns an error message string, or "" when valid.
     --------------------------------------------------------- */
  var Validators = {
    required: function (value, label) {
      return value.trim() === "" ? label + " is required." : "";
    },

    fullName: function (value) {
      var v = value.trim();
      if (v === "") return "Full name is required.";
      if (v.length < 3) return "Enter your full name (at least 3 characters).";
      if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) return "Name can contain only letters, spaces, . ' and -.";
      return "";
    },

    email: function (value) {
      var v = value.trim();
      if (v === "") return "Email address is required.";
      // Practical format check: something@domain.tld
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address, e.g. name@example.com.";
      return "";
    },

    // Indian mobile numbers: 10 digits starting with 6-9. Optional +91 / 91 / 0 prefix.
    mobile: function (value) {
      var v = value.replace(/[\s-]/g, "");
      if (v === "") return "Mobile number is required.";
      if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(v)) return "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.";
      return "";
    },

    // Basic password policy for sign up
    newPassword: function (value) {
      if (value === "") return "Password is required.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      if (!/[a-z]/.test(value)) return "Add at least one lowercase letter.";
      if (!/[A-Z]/.test(value)) return "Add at least one uppercase letter.";
      if (!/\d/.test(value)) return "Add at least one number.";
      if (!/[^A-Za-z0-9]/.test(value)) return "Add at least one symbol, e.g. @ # $ !";
      if (/\s/.test(value)) return "Password cannot contain spaces.";
      return "";
    },

    // Login only checks that something was entered (policy is enforced at sign up)
    loginPassword: function (value) {
      return value === "" ? "Password is required." : "";
    },

    confirmPassword: function (value, original) {
      if (value === "") return "Please confirm your password.";
      if (value !== original) return "Passwords do not match.";
      return "";
    }
  };

  /* ---------------------------------------------------------
     2. UI helpers
     --------------------------------------------------------- */
  function $(id) {
    return document.getElementById(id);
  }

  // Show or clear the error under a field and update its visual state.
  function setFieldState(input, message) {
    var field = input.closest(".field");
    var errorEl = $(input.id + "Error");
    var hasError = message !== "";

    field.classList.toggle("has-error", hasError);
    field.classList.toggle("is-valid", !hasError && input.value !== "");
    input.setAttribute("aria-invalid", hasError ? "true" : "false");
    if (errorEl) errorEl.textContent = message;
    return !hasError;
  }

  // Form-level message. type: "error" | "success" | "info"
  function showMessage(type, text) {
    var box = $("formMessage");
    box.className = "form-message show " + type;
    box.textContent = text;
  }

  function clearMessage() {
    var box = $("formMessage");
    box.className = "form-message";
    box.textContent = "";
  }

  // Show/Hide password buttons: <button data-toggle="inputId">
  function initPasswordToggles() {
    document.querySelectorAll(".toggle-pw").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = $(btn.dataset.toggle);
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? "Hide" : "Show";
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        btn.setAttribute("aria-pressed", String(show));
      });
    });
  }

  // Attach validation on blur, and re-validate on input once an error is showing.
  // rules: [{ input, validate: function() -> message }]
  function bindLiveValidation(rules) {
    rules.forEach(function (rule) {
      rule.input.addEventListener("blur", function () {
        if (rule.input.value !== "") setFieldState(rule.input, rule.validate());
      });
      rule.input.addEventListener("input", function () {
        var field = rule.input.closest(".field");
        if (field.classList.contains("has-error")) setFieldState(rule.input, rule.validate());
      });
    });
  }

  // Run every rule, mark all fields, and focus the first invalid one.
  function validateAll(rules) {
    var firstInvalid = null;
    rules.forEach(function (rule) {
      var ok = setFieldState(rule.input, rule.validate());
      if (!ok && !firstInvalid) firstInvalid = rule.input;
    });
    if (firstInvalid) firstInvalid.focus();
    return firstInvalid === null;
  }

  /* ---------------------------------------------------------
     3. Backend hooks (placeholders for the next phase)
     Replace the bodies with real fetch() calls to your API.
     They currently resolve immediately and do nothing.
     --------------------------------------------------------- */
  var AuthService = {
    // payload: { email, password, remember }
    login: function (payload) {
      // TODO (backend phase): POST to the login endpoint, handle session/token.
      return Promise.resolve({ ok: true, simulated: true });
    },
    // payload: { fullName, email, mobile, password }
    register: function (payload) {
      // TODO (backend phase): POST to the register endpoint, handle duplicate emails etc.
      return Promise.resolve({ ok: true, simulated: true });
    }
  };

  function setLoading(button, loading, idleText, busyText) {
    button.disabled = loading;
    button.textContent = loading ? busyText : idleText;
  }

  /* ---------------------------------------------------------
     4. Login page
     --------------------------------------------------------- */
  function initLogin() {
    var form = $("loginForm");
    if (!form) return;

    var email = $("email");
    var password = $("password");
    var remember = $("remember");
    var btn = $("submitBtn");

    var rules = [
      { input: email, validate: function () { return Validators.email(email.value); } },
      { input: password, validate: function () { return Validators.loginPassword(password.value); } }
    ];
    bindLiveValidation(rules);

    // Forgot password: not available until the backend exists
    $("forgotLink").addEventListener("click", function (e) {
      e.preventDefault();
      showMessage("info", "Password reset will be available once the backend is connected.");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault(); // always stop native submission; we validate first
      clearMessage();

      if (!validateAll(rules)) {
        showMessage("error", "Please fix the highlighted fields and try again.");
        return;
      }

      setLoading(btn, true, "Log in", "Checking...");
      AuthService.login({
        email: email.value.trim(),
        password: password.value,
        remember: remember.checked
      }).then(function () {
        setLoading(btn, false, "Log in", "Checking...");
        // No real login happens yet, so the message says so honestly.
        showMessage("success", "Details look good. Login is not connected to a server yet.");
      });
    });
  }

  /* ---------------------------------------------------------
     5. Sign up page
     --------------------------------------------------------- */
  function initSignup() {
    var form = $("signupForm");
    if (!form) return;

    var fullName = $("fullName");
    var email = $("email");
    var mobile = $("mobile");
    var password = $("password");
    var confirm = $("confirmPassword");
    var btn = $("submitBtn");

    var rules = [
      { input: fullName, validate: function () { return Validators.fullName(fullName.value); } },
      { input: email, validate: function () { return Validators.email(email.value); } },
      { input: mobile, validate: function () { return Validators.mobile(mobile.value); } },
      { input: password, validate: function () { return Validators.newPassword(password.value); } },
      { input: confirm, validate: function () { return Validators.confirmPassword(confirm.value, password.value); } }
    ];
    bindLiveValidation(rules);

    // Mobile: allow only digits, +, spaces and dashes while typing
    mobile.addEventListener("input", function () {
      mobile.value = mobile.value.replace(/[^\d+\s-]/g, "");
    });

    // Password strength meter
    var strengthBox = $("strength");
    var fill = $("strengthFill");
    var text = $("strengthText");
    var levels = [
      { label: "Very weak", color: "#b3261e" },
      { label: "Weak", color: "#d9622b" },
      { label: "Fair", color: "#d9a21b" },
      { label: "Good", color: "#7a9a2e" },
      { label: "Strong", color: "#2e6b3a" }
    ];

    function updateStrength() {
      var v = password.value;
      if (v === "") { strengthBox.hidden = true; return; }
      var score = 0;
      if (v.length >= 8) score++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      var level = levels[score];
      strengthBox.hidden = false;
      fill.style.width = ((score + 1) / levels.length) * 100 + "%";
      fill.style.background = level.color;
      text.textContent = "Password strength: " + level.label;
    }

    password.addEventListener("input", function () {
      updateStrength();
      // Keep the confirm field in sync if it was already filled
      if (confirm.value !== "") setFieldState(confirm, Validators.confirmPassword(confirm.value, password.value));
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearMessage();

      if (!validateAll(rules)) {
        showMessage("error", "Please fix the highlighted fields and try again.");
        return;
      }

      setLoading(btn, true, "Create account", "Creating...");
      AuthService.register({
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        mobile: mobile.value.replace(/[\s-]/g, ""),
        password: password.value
      }).then(function () {
        setLoading(btn, false, "Create account", "Creating...");
        showMessage("success", "Details look good. No account has been saved yet because the backend is not connected. You can go to the login page.");
        form.reset();
        strengthBox.hidden = true;
        form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("is-valid", "has-error"); });
      });
    });
  }

  /* ---------------------------------------------------------
     6. Init
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initPasswordToggles();
    initLogin();
    initSignup();
  });
})();
