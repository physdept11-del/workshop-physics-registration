// script.js - الملف الرئيسي للجافاسكريبت

document.addEventListener('DOMContentLoaded', function() {
    updateRegistrationCount();
    addInputEffects();
    setupEmailValidation();
    setupPhoneValidation();
    setupNationalIdValidation();
});

function updateRegistrationCount() {
    const countElement = document.getElementById('registeredCount');
    if (!countElement) return;
    const submissions = JSON.parse(localStorage.getItem('workshop_submissions') || '[]');
    countElement.textContent = submissions.length;
}

function addInputEffects() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('ring-2', 'ring-blue-200');
        });
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('ring-2', 'ring-blue-200');
        });
    });
}

function setupEmailValidation() {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;
    
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (!email) return;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showInputError(this, 'البريد الإلكتروني غير صالح');
        } else {
            clearInputError(this);
        }
    });
}

function setupPhoneValidation() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('blur', function() {
        const phone = this.value.trim();
        if (!phone) return;
        const phonePattern = /^01[0-9]{9}$/;
        if (!phonePattern.test(phone)) {
            showInputError(this, 'رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 01');
        } else {
            clearInputError(this);
        }
    });
    
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

function setupNationalIdValidation() {
    const nationalIdInput = document.getElementById('national_id');
    if (!nationalIdInput) return;
    
    nationalIdInput.addEventListener('blur', function() {
        const id = this.value.trim();
        if (!id) return;
        const idPattern = /^[0-9]{14}$/;
        if (!idPattern.test(id)) {
            showInputError(this, 'الرقم القومي يجب أن يكون 14 رقماً');
        } else {
            clearInputError(this);
        }
    });
    
    nationalIdInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

function showInputError(input, message) {
    clearInputError(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
    input.classList.add('border-red-500');
}

function clearInputError(input) {
    const errorDiv = input.parentElement.querySelector('.text-red-500');
    if (errorDiv) errorDiv.remove();
    input.classList.remove('border-red-500');
}

function closeModal() {
    const modal = document.getElementById('successModal');
    const modalContent = document.getElementById('modalContent');
    if (!modal || !modalContent) return;
    
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}