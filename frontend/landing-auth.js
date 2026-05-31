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

      // Show loading state
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const spinner = document.getElementById('loginSpinner');
      if (submitButton && spinner) {
        submitButton.classList.add('loading');
        submitButton.disabled = true;
      }

      // Simulate login (replace with actual API call)
      setTimeout(() => {
        // Mock successful login - redirect to main app
        console.log('Login successful:', { email });
        
        // In production, validate credentials with backend
        // For now, redirect to main Synapse app
        window.location.href = '/index.html';
      }, 1500);
    });

    // Google login
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', function() {
        console.log('Google login clicked');
        // Implement Google OAuth flow here
        alert('Google OAuth integration pending. This will connect to Google authentication.');
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

      // Show loading state
      const submitButton = signupForm.querySelector('button[type="submit"]');
      const spinner = document.getElementById('signupSpinner');
      if (submitButton && spinner) {
        submitButton.classList.add('loading');
        submitButton.disabled = true;
      }

      // Simulate signup (replace with actual API call)
      setTimeout(() => {
        // Mock successful signup - redirect to main app
        console.log('Signup successful:', { firstName, lastName, email, role });
        
        // In production, create account via backend API
        // For now, redirect to main Synapse app
        window.location.href = '/index.html';
      }, 1500);
    });

    // Google signup
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    if (googleSignupBtn) {
      googleSignupBtn.addEventListener('click', function() {
        console.log('Google signup clicked');
        // Implement Google OAuth flow here
        alert('Google OAuth integration pending. This will connect to Google authentication.');
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

      // Show loading state
      const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
      const spinner = document.getElementById('resetSpinner');
      if (submitButton && spinner) {
        submitButton.classList.add('loading');
        submitButton.disabled = true;
      }

      // Simulate password reset email (replace with actual API call)
      setTimeout(() => {
        console.log('Password reset email sent to:', email);
        
        // Show success message
        const successDiv = document.getElementById('resetSuccess');
        if (successDiv) {
          successDiv.classList.add('show');
        }

        // Hide loading state
        if (submitButton && spinner) {
          submitButton.classList.remove('loading');
          submitButton.disabled = false;
        }
      }, 1500);
    });
  }

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
