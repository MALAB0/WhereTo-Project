const inputs = Array.from(document.querySelectorAll("input[type='number']")),
    button = document.querySelector("button[type='submit']"),  // Fixed selector
    errorDiv = document.querySelector("#error");

function checkButtonState() {
    const allFilled = inputs.every(inp => inp.value !== "");
    if (allFilled) {
        button.classList.add("active");
        button.removeAttribute("disabled");
    } else {
        button.classList.remove("active");
        button.setAttribute("disabled", "true");
    }
}

inputs.forEach((input, index1) => {
    input.addEventListener("keyup", (e) => {
        const currentInput = input,
            nextInput = input.nextElementSibling,
            prevInput = input.previousElementSibling;

        // Ensure only one digit per input
        if (currentInput.value.length > 1) {
            currentInput.value = "";
            return;
        }

        // Enable next input if current has a value
        if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
            nextInput.removeAttribute("disabled");
            nextInput.focus();
        }

        // Handle backspace
        if (e.key === "Backspace") {
            inputs.forEach((input, index2) => {
                if (index1 <= index2 && prevInput) {
                    input.setAttribute("disabled", true); 
                    currentInput.value = "";
                    prevInput.focus();
                }
            });
        }

        // Check button state
        checkButtonState();
    });

    // Paste handler
    input.addEventListener("paste", (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
        if (pasteData.length === 4) {
            inputs.forEach((inp, i) => {
                inp.value = pasteData[i] || '';
                inp.removeAttribute("disabled");
            });
            checkButtonState();
            inputs[3].focus();
        } else {
            inputs.forEach(inp => inp.value = '');
            errorDiv.textContent = 'Please paste a valid 4-digit code.';
            errorDiv.style.display = 'block';
        }
    });
});

// Resend OTP functionality
const resendLink = document.getElementById('resendLink');
if (resendLink) {
    resendLink.addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            const res = await fetch('/resend-otp', { 
                method: 'POST',
                credentials: 'include'  // Added to send cookies/session data
            });
            if (res.ok) {
                showToast('OTP resent to your email!', 'success');
            } else {
                // Try to parse JSON error, fallback to text
                let errMsg = 'Failed to resend OTP';
                try { const j = await res.json(); errMsg = j.error || j.message || errMsg; } catch (_) { errMsg = await res.text(); }
                showToast(errMsg, 'error');
            }
        } catch (err) {
            console.error('Resend error:', err);
            showToast('Failed to resend OTP.', 'error');
        }
    });
}

// Form submission
document.getElementById('otpForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    errorDiv.style.display = 'none'; // Clear any previous errors
    
    console.log('=== OTP Form Submission ===');
    
    // Get values from each input
    const inputValues = inputs.map((inp, i) => ({
        position: i + 1,
        value: inp.value,
        disabled: inp.disabled
    }));
    console.log('Input field states:', inputValues);
    
    const code = Array.from(inputs).map(inp => inp.value).join('');
    console.log('Combined OTP code:', code);
    
    if (code.length !== 4) {
        console.log('Validation failed: code length', code.length);
        errorDiv.textContent = 'Please enter a valid 4-digit code';
        errorDiv.style.display = 'block';
        return;
    }

        try {
            // Disable form while processing
            button.setAttribute("disabled", "true");
            button.textContent = "Verifying...";
            
            const res = await fetch('/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
                credentials: 'include'
            });

            let data;
            try {
                data = await res.json();
                console.log('Server response:', data);
            } catch (e) {
                console.error('Failed to parse response:', e);
                throw new Error('Invalid server response');
            }
            
            if (res.ok && data.redirect) {
                showToast('Verification successful!', 'success');
                console.log('Redirecting to:', data.redirect);
                // Use window.location.replace to prevent back button from returning to OTP page
                setTimeout(() => window.location.replace(data.redirect), 1500);
                return;
            }
            
            // Handle various error cases
            if (data.error) {
                if (data.error.includes('expired')) {
                    showToast('OTP has expired. Please request a new one.', 'error');
                } else if (data.error.includes('not match')) {
                    showToast('Invalid OTP code. Please try again.', 'error');
                } else {
                    showToast(data.error, 'error');
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Re-enable form
            button.removeAttribute("disabled");
            button.textContent = "Verify";
            checkButtonState();
        }
});

window.addEventListener("load", () => inputs[0].focus());

// Toast function
function showToast(message, type = 'info') {
  let bgColor = 'blue';
  if (type === 'success') bgColor = 'green';
  if (type === 'error') bgColor = 'red';
  Toastify({
    text: message,
    duration: 5000,
    gravity: "top",
    position: "right",
    backgroundColor: bgColor,
    close: true
  }).showToast();
}