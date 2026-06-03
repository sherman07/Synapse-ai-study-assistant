/* ==========================================
   Synapse Landing & Auth Pages JavaScript
   ========================================== */

(function() {
  'use strict';

  // ==========================================
  // Utility Functions
  // ==========================================
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  }

  function clearAllErrors() {
    const errors = document.querySelectorAll('.auth-error');
    errors.forEach(error => {
      error.textContent = '';
      error.classList.remove('show');
    });
  }

  function appEntryUrl() {
    const path = window.location.pathname || '';
    if (path.includes('/frontend/')) {
      return 'index.html';
    }
    return 'frontend/index.html';
  }

  const AUTH_ACCOUNTS_KEY = 'synapse.auth.accounts.v1';
  const AUTH_SESSION_KEY = 'synapse.auth.session.v1';
  const AUTH_LAST_EMAIL_KEY = 'synapse.auth.lastEmail.v1';

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function readJSONStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
      console.warn(`Could not read ${key}:`, error);
      return fallback;
    }
  }

  function writeJSONStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Could not save ${key}:`, error);
      return false;
    }
  }

  function getAccounts() {
    const accounts = readJSONStorage(AUTH_ACCOUNTS_KEY, []);
    return Array.isArray(accounts) ? accounts : [];
  }

  function saveAccounts(accounts) {
    return writeJSONStorage(AUTH_ACCOUNTS_KEY, accounts);
  }

  function hashCredential(email, password) {
    const source = `${normalizeEmail(email)}::${String(password || '')}`;
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i = 0; i < source.length; i += 1) {
      const code = source.charCodeAt(i);
      h1 ^= code;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 ^= code + 0x7f4a7c15;
      h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
    }
    return `${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
  }

  function displayNameFor(account) {
    return [account?.firstName, account?.lastName].filter(Boolean).join(' ').trim() || account?.email || 'Synapse Student';
  }

  function publicSessionFor(account) {
    return {
      accountId: account.id,
      email: account.email,
      displayName: displayNameFor(account),
      firstName: account.firstName || '',
      lastName: account.lastName || '',
      role: account.role || 'student',
      plan: account.plan || 'Starter',
      credits: Number(account.credits || 500),
      authProvider: account.authProvider || 'email',
      createdAt: account.createdAt || new Date().toISOString(),
      signedInAt: new Date().toISOString()
    };
  }

  function setSession(account) {
    writeJSONStorage(AUTH_SESSION_KEY, publicSessionFor(account));
    try {
      window.localStorage.setItem(AUTH_LAST_EMAIL_KEY, account.email || '');
    } catch {
      // Storage may be unavailable in rare private browsing modes.
    }
  }

  function findAccountByEmail(email) {
    const normalized = normalizeEmail(email);
    return getAccounts().find(account => normalizeEmail(account.email) === normalized) || null;
  }

  function setButtonLoading(form, spinnerId, isLoading) {
    const submitButton = form?.querySelector('button[type="submit"]');
    const spinner = document.getElementById(spinnerId);
    if (submitButton && spinner) {
      submitButton.classList.toggle('loading', isLoading);
      submitButton.disabled = Boolean(isLoading);
    }
  }

  function redirectToApp() {
    window.location.href = appEntryUrl();
  }

  function createAccount({ firstName, lastName, email, role, password, authProvider = 'email' }) {
    const normalizedEmail = normalizeEmail(email);
    const accounts = getAccounts();
    const now = new Date().toISOString();
    const account = {
      id: `acct_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      firstName: String(firstName || '').trim(),
      lastName: String(lastName || '').trim(),
      email: normalizedEmail,
      role: role || 'student',
      authProvider,
      passwordHash: authProvider === 'email' ? hashCredential(normalizedEmail, password) : '',
      plan: 'Starter',
      credits: 500,
      createdAt: now,
      updatedAt: now
    };
    accounts.unshift(account);
    saveAccounts(accounts);
    return account;
  }

  function continueWithGoogle() {
    const email = normalizeEmail(window.prompt('Enter the Google email you want to use with Synapse:') || '');
    if (!email) return;
    if (!validateEmail(email)) {
      alert('Please enter a valid Google email address.');
      return;
    }
    let account = findAccountByEmail(email);
    if (!account) {
      const name = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
      account = createAccount({
        firstName: name ? name.replace(/\b\w/g, char => char.toUpperCase()) : 'Google',
        lastName: '',
        email,
        role: 'student',
        authProvider: 'google'
      });
    }
    setSession(account);
    redirectToApp();
  }

  // ==========================================
  // Modal Functions
  // ==========================================
  
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ==========================================
  // Navigation
  // ==========================================
  
  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      const navMenu = document.getElementById('navMenu');
      if (navMenu) {
        navMenu.classList.toggle('active');
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ==========================================
  // Get Started Actions
  // ==========================================
  
  const getStartedButtons = document.querySelectorAll('[data-action="get-started"]');
  getStartedButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      openModal('authModal');
    });
  });

  // Modal close handlers
  const closeModalButtons = document.querySelectorAll('[data-close-modal]');
  closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
      closeModal('authModal');
    });
  });

  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal('authModal');
    }
  });

  // ==========================================
  // Login Form
  // ==========================================
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const loginPassword = document.getElementById('loginPassword');
    
    if (togglePassword && loginPassword) {
      togglePassword.addEventListener('click', function() {
        const type = loginPassword.type === 'password' ? 'text' : 'password';
        loginPassword.type = type;
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('bi-eye');
          icon.classList.toggle('bi-eye-slash');
        }
      });
    }

    // Form submission
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearAllErrors();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      
      let hasError = false;

      // Validate email
      if (!email) {
        showError('emailError', 'Email is required');
        hasError = true;
      } else if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        hasError = true;
      }

      // Validate password
      if (!password) {
        showError('passwordError', 'Password is required');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      const account = findAccountByEmail(email);
      if (!account) {
        showError('emailError', 'No Synapse account exists for this email. Create one first.');
        return;
      }
      if (account.authProvider !== 'email') {
        showError('passwordError', 'This account was created with Google. Continue with Google instead.');
        return;
      }
      if (account.passwordHash !== hashCredential(email, password)) {
        showError('passwordError', 'Incorrect password');
        return;
      }

      setButtonLoading(loginForm, 'loginSpinner', true);
      setSession(account);
      redirectToApp();
    });

    // Google login
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', function() {
        continueWithGoogle();
      });
    }
  }

  // ==========================================
  // Signup Form
  // ==========================================
  
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    // Toggle password visibility for signup
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');
    const signupPassword = document.getElementById('signupPassword');
    
    if (toggleSignupPassword && signupPassword) {
      toggleSignupPassword.addEventListener('click', function() {
        const type = signupPassword.type === 'password' ? 'text' : 'password';
        signupPassword.type = type;
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('bi-eye');
          icon.classList.toggle('bi-eye-slash');
        }
      });
    }

    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (toggleConfirmPassword && confirmPassword) {
      toggleConfirmPassword.addEventListener('click', function() {
        const type = confirmPassword.type === 'password' ? 'text' : 'password';
        confirmPassword.type = type;
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('bi-eye');
          icon.classList.toggle('bi-eye-slash');
        }
      });
    }

    // Form submission
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearAllErrors();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const role = document.getElementById('role').value;
      const password = document.getElementById('signupPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;
      const termsCheckbox = signupForm.querySelector('input[name="terms"]');
      
      let hasError = false;

      // Validate first name
      if (!firstName) {
        showError('firstNameError', 'First name is required');
        hasError = true;
      }

      // Validate last name
      if (!lastName) {
        showError('lastNameError', 'Last name is required');
        hasError = true;
      }

      // Validate email
      if (!email) {
        showError('signupEmailError', 'Email is required');
        hasError = true;
      } else if (!validateEmail(email)) {
        showError('signupEmailError', 'Please enter a valid email address');
        hasError = true;
      }

      // Validate password
      if (!password) {
        showError('signupPasswordError', 'Password is required');
        hasError = true;
      } else if (password.length < 8) {
        showError('signupPasswordError', 'Password must be at least 8 characters');
        hasError = true;
      }

      // Validate confirm password
      if (!confirmPass) {
        showError('confirmPasswordError', 'Please confirm your password');
        hasError = true;
      } else if (password !== confirmPass) {
        showError('confirmPasswordError', 'Passwords do not match');
        hasError = true;
      }

      // Validate terms
      if (termsCheckbox && !termsCheckbox.checked) {
        showError('termsError', 'You must agree to the Terms and Privacy Policy');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      if (findAccountByEmail(email)) {
        showError('signupEmailError', 'An account already exists for this email. Login instead.');
        return;
      }

      setButtonLoading(signupForm, 'signupSpinner', true);
      const account = createAccount({ firstName, lastName, email, role, password });
      setSession(account);
      redirectToApp();
    });

    // Google signup
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    if (googleSignupBtn) {
      googleSignupBtn.addEventListener('click', function() {
        continueWithGoogle();
      });
    }
  }

  // ==========================================
  // Forgot Password Form
  // ==========================================
  
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearAllErrors();

      const email = document.getElementById('resetEmail').value.trim();
      
      let hasError = false;

      // Validate email
      if (!email) {
        showError('resetEmailError', 'Email is required');
        hasError = true;
      } else if (!validateEmail(email)) {
        showError('resetEmailError', 'Please enter a valid email address');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      const account = findAccountByEmail(email);
      if (!account) {
        showError('resetEmailError', 'No Synapse account exists for this email.');
        return;
      }

      setButtonLoading(forgotPasswordForm, 'resetSpinner', true);
      setTimeout(() => {
        writeJSONStorage('synapse.auth.reset.v1', {
          email: normalizeEmail(email),
          requestedAt: new Date().toISOString()
        });
        const successDiv = document.getElementById('resetSuccess');
        if (successDiv) {
          successDiv.classList.add('show');
        }
        setButtonLoading(forgotPasswordForm, 'resetSpinner', false);
      }, 1500);
    });
  }

  // ==========================================
  // Mouse tracking for feature cards (3D effect)
  // ==========================================
  
  const featureCards = document.querySelectorAll('.landing-feature-card');
  featureCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });

  // ==========================================
  // Scroll Animations (Simple fade-in on scroll)
  // ==========================================
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements with data-aos attribute
  document.querySelectorAll('[data-aos]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // ==========================================
  // Voucher Code Feature (Placeholder)
  // ==========================================
  
  // This can be implemented when checkout flow is built
  // For now, it's just visual on the pricing page

  // ==========================================
  // Console Welcome Message
  // ==========================================
  
  console.log('%cWelcome to Synapse! 🧠', 'color: #4a7cff; font-size: 24px; font-weight: bold;');
  console.log('%cTurn passive study notes into active learning', 'color: #64748b; font-size: 14px;');

})();
