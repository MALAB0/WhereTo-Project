const inputs = document.querySelectorAll("input[type='number']"),
    button = document.querySelector("#verifyBtn"),
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

// Form submission (unchanged)
document.getElementById('otpForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const code = Array.from(inputs).map(inp => inp.value).join('');  // Use Array.from for safety
    if (code.length !== 4) {
        errorDiv.textContent = 'Please enter a valid 4-digit code';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const res = await fetch('/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        if (res.ok) {
            const data = await res.json();
            showToast('Verification successful!', 'success');
            setTimeout(() => window.location.href = data.redirect, 2000);
        } else {
            const error = await res.text();
            errorDiv.textContent = error;
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        console.error('OTP verification error:', err);
        errorDiv.textContent = 'Something went wrong. Please try again.';
        errorDiv.style.display = 'block';
    }
});

window.addEventListener("load", () => inputs[0].focus());

// Toast function (unchanged)
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