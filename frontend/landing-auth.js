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
    document.querySelectorAll('[aria-invalid="true"]').forEach(field => {
      field.setAttribute('aria-invalid', 'false');
    });
  }

  function markInvalid(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    if (field && typeof field.setAttribute === 'function') {
      field.setAttribute('aria-invalid', 'true');
    }
    showError(errorId, message);
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

  function sanitizeLocalAccount(account) {
    const safe = { ...(account || {}) };
    delete safe.password;
    delete safe.passwordHash;
    delete safe.password_hash;
    delete safe.credential;
    delete safe.credentialHash;
    delete safe.salt;
    safe.email = normalizeEmail(safe.email);
    safe.authMode = safe.authMode || 'local_demo';
    return safe;
  }

  function saveAccounts(accounts) {
    const safeAccounts = (Array.isArray(accounts) ? accounts : []).map(sanitizeLocalAccount);
    return writeJSONStorage(AUTH_ACCOUNTS_KEY, safeAccounts);
  }

  function getAccounts() {
    const accounts = readJSONStorage(AUTH_ACCOUNTS_KEY, []);
    if (!Array.isArray(accounts)) return [];
    const safeAccounts = accounts.map(sanitizeLocalAccount);
    if (JSON.stringify(accounts) !== JSON.stringify(safeAccounts)) {
      saveAccounts(safeAccounts);
    }
    return safeAccounts;
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
      authMode: account.authMode || 'local_demo',
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

  function realAuthEnabled() {
    return Boolean(window.SynapseAuth?.isConfigured?.());
  }

  function showAuthStatus(form, type, message) {
    if (!form) return;
    let status = form.querySelector('.auth-form-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'auth-form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) form.insertBefore(status, submitButton);
      else form.appendChild(status);
    }
    status.textContent = message;
    status.className = `auth-form-status show ${type}`;
  }

  function clearAuthStatus(form) {
    const status = form?.querySelector?.('.auth-form-status');
    if (status) {
      status.textContent = '';
      status.className = 'auth-form-status';
    }
  }

  function createAccount({ firstName, lastName, email, role, authProvider = 'email' }) {
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
      authMode: 'local_demo',
      plan: 'Starter',
      credits: 500,
      createdAt: now,
      updatedAt: now
    };
    accounts.unshift(sanitizeLocalAccount(account));
    saveAccounts(accounts);
    return sanitizeLocalAccount(account);
  }

  function continueWithGoogle() {
    if (realAuthEnabled()) {
      window.SynapseAuth.signInWithGoogle({
        redirectTo: new URL(appEntryUrl(), window.location.href).toString()
      }).catch(error => {
        alert(error.message || 'Google sign-in could not start.');
      });
      return;
    }
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
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const closeButton = modal.querySelector('button[data-close-modal]');
      if (closeButton && typeof closeButton.focus === 'function') {
        closeButton.focus();
      }
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
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
        const isActive = navMenu.classList.toggle('active');
        mobileToggle.setAttribute('aria-expanded', String(isActive));
        mobileToggle.setAttribute('aria-label', isActive ? 'Close navigation menu' : 'Open navigation menu');
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
          const navMenu = document.getElementById('navMenu');
          if (navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileToggle?.setAttribute('aria-expanded', 'false');
            mobileToggle?.setAttribute('aria-label', 'Open navigation menu');
          }
        }
      }
    });
  });

  document.querySelectorAll('[data-action="view-demo"]').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById('how-it-works');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        this.setAttribute('aria-pressed', String(type === 'text'));
        this.setAttribute('aria-label', type === 'text' ? 'Hide password' : 'Show password');
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
      clearAuthStatus(loginForm);

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      
      let hasError = false;

      // Validate email
      if (!email) {
        markInvalid('loginEmail', 'emailError', 'Email is required');
        hasError = true;
      } else if (!validateEmail(email)) {
        markInvalid('loginEmail', 'emailError', 'Please enter a valid email address');
        hasError = true;
      }

      // Validate password
      if (!password) {
        markInvalid('loginPassword', 'passwordError', 'Password is required');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      if (realAuthEnabled()) {
        setButtonLoading(loginForm, 'loginSpinner', true);
        window.SynapseAuth.signInEmail({ email, password })
          .then(() => {
            redirectToApp();
          })
          .catch(error => {
            markInvalid('loginEmail', 'emailError', error.message || 'Login failed.');
            showAuthStatus(loginForm, 'error', error.message || 'Login failed.');
          })
          .finally(() => {
            setButtonLoading(loginForm, 'loginSpinner', false);
          });
        return;
      }

      const account = findAccountByEmail(email);
      if (!account) {
        markInvalid('loginEmail', 'emailError', 'No Synapse account exists for this email. Create one first.');
        return;
      }
      if (account.authProvider !== 'email') {
        markInvalid('loginPassword', 'passwordError', 'This account was created with Google. Continue with Google instead.');
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
        this.setAttribute('aria-pressed', String(type === 'text'));
        this.setAttribute('aria-label', type === 'text' ? 'Hide password' : 'Show password');
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
        this.setAttribute('aria-pressed', String(type === 'text'));
        this.setAttribute('aria-label', type === 'text' ? 'Hide confirmed password' : 'Show confirmed password');
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
      clearAuthStatus(signupForm);

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
        markInvalid('firstName', 'firstNameError', 'First name is required');
        hasError = true;
      }

      // Validate last name
      if (!lastName) {
        markInvalid('lastName', 'lastNameError', 'Last name is required');
        hasError = true;
      }

      // Validate email
      if (!email) {
        markInvalid('signupEmail', 'signupEmailError', 'Email is required');
        hasError = true;
      } else if (!validateEmail(email)) {
        markInvalid('signupEmail', 'signupEmailError', 'Please enter a valid email address');
        hasError = true;
      }

      // Validate password
      if (!password) {
        markInvalid('signupPassword', 'signupPasswordError', 'Password is required');
        hasError = true;
      } else if (password.length < 8) {
        markInvalid('signupPassword', 'signupPasswordError', 'Password must be at least 8 characters');
        hasError = true;
      }

      // Validate confirm password
      if (!confirmPass) {
        markInvalid('confirmPassword', 'confirmPasswordError', 'Please confirm your password');
        hasError = true;
      } else if (password !== confirmPass) {
        markInvalid('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
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

      if (realAuthEnabled()) {
        setButtonLoading(signupForm, 'signupSpinner', true);
        window.SynapseAuth.signUpEmail({ firstName, lastName, email, role, password })
          .then(result => {
            if (result?.requiresEmailConfirmation) {
              showAuthStatus(signupForm, 'success', 'Account created. Check your email to confirm your Synapse account, then login.');
              signupForm.reset();
              return;
            }
            redirectToApp();
          })
          .catch(error => {
            markInvalid('signupEmail', 'signupEmailError', error.message || 'Sign up failed.');
            showAuthStatus(signupForm, 'error', error.message || 'Sign up failed.');
          })
          .finally(() => {
            setButtonLoading(signupForm, 'signupSpinner', false);
          });
        return;
      }

      if (findAccountByEmail(email)) {
        markInvalid('signupEmail', 'signupEmailError', 'An account already exists for this email. Login instead.');
        return;
      }

      setButtonLoading(signupForm, 'signupSpinner', true);
      const account = createAccount({ firstName, lastName, email, role });
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
      clearAuthStatus(forgotPasswordForm);

      const email = document.getElementById('resetEmail').value.trim();
      
      let hasError = false;

      // Validate email
      if (!email) {
        markInvalid('resetEmail', 'resetEmailError', 'Email is required');
        hasError = true;
      } else if (!validateEmail(email)) {
        markInvalid('resetEmail', 'resetEmailError', 'Please enter a valid email address');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      if (realAuthEnabled()) {
        setButtonLoading(forgotPasswordForm, 'resetSpinner', true);
        window.SynapseAuth.resetPassword(email)
          .then(() => {
            const successDiv = document.getElementById('resetSuccess');
            if (successDiv) successDiv.classList.add('show');
            forgotPasswordForm.classList?.add('d-none');
            forgotPasswordForm.closest?.('.auth-card')?.classList.add('reset-complete');
          })
          .catch(error => {
            markInvalid('resetEmail', 'resetEmailError', error.message || 'Password reset failed.');
            showAuthStatus(forgotPasswordForm, 'error', error.message || 'Password reset failed.');
          })
          .finally(() => {
            setButtonLoading(forgotPasswordForm, 'resetSpinner', false);
          });
        return;
      }

      const account = findAccountByEmail(email);
      if (!account) {
        markInvalid('resetEmail', 'resetEmailError', 'No Synapse account exists for this email.');
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
        forgotPasswordForm.classList?.add('d-none');
        forgotPasswordForm.closest?.('.auth-card')?.classList.add('reset-complete');
        setButtonLoading(forgotPasswordForm, 'resetSpinner', false);
      }, 1500);
    });
  }

  // ==========================================
  // Contact Form
  // ==========================================

  const CONTACT_INQUIRIES_KEY = 'synapse.contact.inquiries.v1';

  function contactEndpoint() {
    const configured = String(
      window.SYNAPSE_CONTACT_ENDPOINT ||
      document.body?.dataset?.contactEndpoint ||
      ''
    ).trim();
    if (configured) return configured;

    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return `${protocol}//127.0.0.1:8001/contact`;
    }
    return '';
  }

  function showContactStatus(type, message) {
    const status = document.getElementById('contactStatus');
    if (!status) return;
    status.textContent = message;
    status.className = `landing-contact-status show ${type}`;
  }

  function saveLocalContactInquiry(payload) {
    const inquiries = readJSONStorage(CONTACT_INQUIRIES_KEY, []);
    const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
    safeInquiries.unshift({
      ...payload,
      savedAt: new Date().toISOString(),
      delivery: 'local_pending'
    });
    return writeJSONStorage(CONTACT_INQUIRIES_KEY, safeInquiries.slice(0, 25));
  }

  async function sendContactInquiry(payload) {
    if (payload.company) {
      return { ok: true, message: 'Thanks, your enquiry has been received.' };
    }

    const endpoint = contactEndpoint();
    if (!endpoint) {
      saveLocalContactInquiry(payload);
      return {
        ok: true,
        localOnly: true,
        message: 'Thanks, your enquiry has been saved for launch testing. Configure SYNAPSE_CONTACT_ENDPOINT before accepting live public submissions.'
      };
    }

    if (typeof window.fetch !== 'function') {
      throw new Error('Contact delivery requires a browser with fetch support.');
    }

    const response = await window.fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      throw new Error(data.error || `Contact request failed with status ${response.status}.`);
    }
    return {
      ok: true,
      message: data.message || 'Thanks, your enquiry has been received.'
    };
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      clearAllErrors();
      showContactStatus('info', 'Sending your enquiry...');

      const formData = new FormData(contactForm);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        email: normalizeEmail(formData.get('email')),
        interest: String(formData.get('interest') || 'general').trim(),
        message: String(formData.get('message') || '').trim(),
        company: String(formData.get('company') || '').trim(),
        source: 'synapse_landing'
      };

      let hasError = false;
      if (!payload.name) {
        markInvalid('contactName', 'contactNameError', 'Name is required');
        hasError = true;
      }
      if (!payload.email) {
        markInvalid('contactEmail', 'contactEmailError', 'Email is required');
        hasError = true;
      } else if (!validateEmail(payload.email)) {
        markInvalid('contactEmail', 'contactEmailError', 'Please enter a valid email address');
        hasError = true;
      }
      if (!payload.message) {
        markInvalid('contactMessage', 'contactMessageError', 'Message is required');
        hasError = true;
      } else if (payload.message.length < 12) {
        markInvalid('contactMessage', 'contactMessageError', 'Please add a little more detail');
        hasError = true;
      }

      if (hasError) {
        showContactStatus('error', 'Please fix the highlighted fields before sending.');
        return;
      }

      setButtonLoading(contactForm, 'contactSpinner', true);
      try {
        const result = await sendContactInquiry(payload);
        showContactStatus(result.localOnly ? 'info' : 'success', result.message);
        if (!result.localOnly) {
          contactForm.reset();
        }
      } catch (error) {
        saveLocalContactInquiry(payload);
        showContactStatus(
          'error',
          `${error.message || 'Contact delivery failed.'} The enquiry was saved locally so you can retry after configuring the endpoint.`
        );
      } finally {
        setButtonLoading(contactForm, 'contactSpinner', false);
      }
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

  if ('IntersectionObserver' in window) {
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
  }

  // ==========================================
  // Voucher redemption should be connected when production checkout is added.
  // ==========================================
  
  // ==========================================
  // Console Welcome Message
  // ==========================================
  
  if (window.SYNAPSE_DEBUG === true) {
    console.log('%cWelcome to Synapse!', 'color: #4a7cff; font-size: 24px; font-weight: bold;');
    console.log('%cTurn passive study notes into active learning', 'color: #64748b; font-size: 14px;');
  }

})();
