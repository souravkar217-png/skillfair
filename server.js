const form = document.getElementById("studentForm");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

/* =========================
   FORM SUBMIT
========================= */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    /* BUTTON LOADING */

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Submitting...";

    message.className = "loading";
    message.innerHTML = "Please wait... Generating certificate";

    /* FORM DATA */

    const studentData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value,
        sem: document.getElementById("sem").value,
        project: document.getElementById("project").value.trim(),
        place: document.getElementById("place").value.trim()
    };

    /* VALIDATION */

    if (
        !studentData.name ||
        !studentData.email ||
        !studentData.course ||
        !studentData.sem ||
        !studentData.project ||
        !studentData.place
    ) {

        message.className = "error";
        message.innerHTML = "Please fill all fields";

        submitBtn.disabled = false;
        submitBtn.innerHTML = "Submit Registration";

        return;
    }

    try {

        /* API REQUEST */

        const response = await fetch(
            "https://skillfair.onrender.com/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(studentData)
            }
        );

        /* RESPONSE */

        const result = await response.json();

        if (response.ok && result.success) {

            message.className = "success";
            message.innerHTML =
                "Registration Successful + Certificate Sent To Email!";

            form.reset();

        } else {

            message.className = "error";
            message.innerHTML =
                result.message || "Registration Failed";
        }

    } catch (error) {

        console.log(error);

        message.className = "error";
        message.innerHTML =
            "Server Error! Please try again later.";
    }

    /* BUTTON RESET */

    submitBtn.disabled = false;
    submitBtn.innerHTML = "Submit Registration";
});
