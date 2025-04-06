function redirectTo(url) {
    window.location.href = url;
}
document.addEventListener("DOMContentLoaded", () => {
    console.log("Faculty Dashboard Loaded");

    // ✅ Validate YouTube Link Before Submission
    document.querySelector("form[action='/faculty/add-youtube']").addEventListener("submit", function (event) {
        const urlInput = this.querySelector("input[name='url']").value;
        if (!isValidYouTubeURL(urlInput)) {
            event.preventDefault();
            alert("❌ Please enter a valid YouTube URL!");
        }
    });

    // ✅ Validate GitHub Link Before Submission
    document.querySelector("form[action='/faculty/add-github']").addEventListener("submit", function (event) {
        const urlInput = this.querySelector("input[name='url']").value;
        if (!isValidGitHubURL(urlInput)) {
            event.preventDefault();
            alert("❌ Please enter a valid GitHub URL!");
        }
    });

    // ✅ Delete Quiz Without Reloading
    document.querySelectorAll("form[action^='/faculty/delete-quiz/']").forEach(form => {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!confirm("Are you sure you want to delete this quiz?")) return;

            const quizId = this.action.split("/").pop();
            try {
                const response = await fetch(`/faculty/delete-quiz/${quizId}`, { method: "POST" });
                if (response.ok) {
                    alert("✅ Quiz deleted successfully!");
                    this.parentElement.remove(); // Remove the quiz from the UI
                } else {
                    alert("❌ Failed to delete quiz.");
                }
            } catch (error) {
                alert("❌ Error deleting quiz.");
            }
        });
    });
});

// ✅ Helper Function: Validate YouTube URL
function isValidYouTubeURL(url) {
    return url.includes("youtube.com/watch?v=") || url.includes("youtu.be/");
}

// ✅ Helper Function: Validate GitHub URL
function isValidGitHubURL(url) {
    return url.includes("github.com/");
}

function deleteQuiz(quizId) {
    if (confirm("Are you sure you want to delete this quiz?")) {
        fetch(`/faculty/delete-quiz/${quizId}`, {
            method: "POST"
        }).then(() => {
            window.location.reload();
        }).catch((err) => alert("❌ Error deleting quiz"));
    }
}
