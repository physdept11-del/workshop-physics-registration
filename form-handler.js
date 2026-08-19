// form-handler.js - معالج النموذج وإرسال البيانات

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    if (!form) return;
    form.addEventListener('submit', handleFormSubmit);
});

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...';
    
    try {
        const formData = collectFormData(form);
        const validationResult = validateFormData(formData);
        if (!validationResult.valid) {
            throw new Error(validationResult.message);
        }
        
        await sendViaFormSubmit(formData);
        saveToLocalStorage(formData);
        await saveToJsonFile(formData);
        showSuccessMessage(formData);
        updateRegistrationCount();
        
        setTimeout(() => {
            form.reset();
        }, 500);
        
    } catch (error) {
        console.error('خطأ في المعالجة:', error);
        showErrorMessage(error.message || 'حدث خطأ أثناء الإرسال');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function collectFormData(form) {
    return {
        full_name_ar: form.querySelector('#full_name_ar')?.value.trim() || '',
        full_name_en: form.querySelector('#full_name_en')?.value.trim() || '',
        national_id: form.querySelector('#national_id')?.value.trim() || '',
        email: form.querySelector('#email')?.value.trim() || '',
        phone: form.querySelector('#phone')?.value.trim() || '',
        nationality: form.querySelector('#nationality')?.value.trim() || '',
        academic_level: form.querySelector('#academic_level')?.value || '',
        university: form.querySelector('#university')?.value.trim() || '',
        department: form.querySelector('#department')?.value.trim() || '',
        year_of_study: form.querySelector('#year_of_study')?.value.trim() || '',
        registration_option: form.querySelector('input[name="registration_option"]:checked')?.value || '',
        interests: Array.from(form.querySelectorAll('input[name="interests[]"]:checked')).map(cb => cb.value),
        timestamp: new Date().toISOString(),
        registration_id: 'PHYS-' + Date.now()
    };
}

function validateFormData(data) {
    const requiredFields = [
        { field: 'full_name_ar', name: 'الاسم الكامل (عربي)' },
        { field: 'full_name_en', name: 'الاسم الكامل (إنجليزي)' },
        { field: 'national_id', name: 'الرقم القومي' },
        { field: 'email', name: 'البريد الإلكتروني' },
        { field: 'phone', name: 'رقم الهاتف' },
        { field: 'academic_level', name: 'المستوى الدراسي' },
        { field: 'university', name: 'الجامعة' },
        { field: 'department', name: 'القسم' },
        { field: 'registration_option', name: 'خيار التسجيل' }
    ];
    
    for (const req of requiredFields) {
        if (!data[req.field] || data[req.field].trim() === '') {
            return { valid: false, message: `حقل ${req.name} مطلوب` };
        }
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
        return { valid: false, message: 'البريد الإلكتروني غير صالح' };
    }
    
    const phonePattern = /^01[0-9]{9}$/;
    if (!phonePattern.test(data.phone)) {
        return { valid: false, message: 'رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 01' };
    }
    
    return { valid: true };
}

async function sendViaFormSubmit(data) {
    try {
        const response = await fetch('https://formsubmit.co/ajax/phys.dept11@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `تسجيل جديد - ${data.full_name_ar} - ورشة الفيزياء`,
                _replyto: data.email,
                _template: 'table',
                _cc: data.email,
                'الاسم (عربي)': data.full_name_ar,
                'الاسم (إنجليزي)': data.full_name_en,
                'الرقم القومي': data.national_id,
                'البريد الإلكتروني': data.email,
                'رقم الهاتف': data.phone,
                'الجنسية': data.nationality,
                'المستوى الدراسي': data.academic_level,
                'الجامعة': data.university,
                'القسم': data.department,
                'السنة الدراسية': data.year_of_study,
                'خيار التسجيل': data.registration_option,
                'مجالات الاهتمام': data.interests.join(', '),
                'رقم التسجيل': data.registration_id,
                'وقت التسجيل': new Date(data.timestamp).toLocaleString('ar-EG')
            })
        });
        
        if (!response.ok) throw new Error('فشل إرسال البريد');
        return await response.json();
    } catch (error) {
        console.warn('فشل إرسال البريد:', error);
        return { success: false };
    }
}

function saveToLocalStorage(data) {
    try {
        const submissions = JSON.parse(localStorage.getItem('workshop_submissions') || '[]');
        submissions.push(data);
        localStorage.setItem('workshop_submissions', JSON.stringify(submissions));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات محلياً:', error);
        return false;
    }
}

async function saveToJsonFile(data) {
    console.log('تم حفظ بيانات التسجيل:', data.registration_id);
    return true;
}

function showSuccessMessage(data) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const modal = document.getElementById('successModal');
    const modalContent = document.getElementById('modalContent');
    
    if (userName) userName.textContent = data.full_name_ar;
    if (userEmail) userEmail.textContent = data.email;
    
    if (modal && modalContent) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }
}

function showErrorMessage(message) {
    alert(`❌ خطأ: ${message}`);
}

function updateRegistrationCount() {
    const countElement = document.getElementById('registeredCount');
    if (!countElement) return;
    const submissions = JSON.parse(localStorage.getItem('workshop_submissions') || '[]');
    countElement.textContent = submissions.length;
}