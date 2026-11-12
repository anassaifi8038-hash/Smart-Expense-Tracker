
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateDashboard() {
    let income = 0;
    let expense = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "Income") {
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }
    });

    document.getElementById("income").textContent =
        "₹" + income.toFixed(2);

    document.getElementById("expense").textContent =
        "₹" + expense.toFixed(2);

    document.getElementById("balance").textContent =
        "₹" + (income - expense).toFixed(2);
}

function showTransactions() {
    const list = document.getElementById("transactionList");
    list.innerHTML = "";

    if (transactions.length === 0) {
        list.textContent = "No transactions yet.";
        return;
    }

    transactions.forEach(function(transaction, index) {
        const item = document.createElement("div");

        item.style.padding = "15px";
        item.style.borderBottom = "1px solid #ddd";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.alignItems = "center";
        item.style.gap = "10px";

        const details = document.createElement("div");

        const heading = document.createElement("strong");
        heading.textContent = transaction.title;

        const info = document.createElement("p");
        info.textContent =
            transaction.category + " | " + transaction.type;

        details.appendChild(heading);
        details.appendChild(info);

        const amount = document.createElement("strong");
        amount.textContent =
            (transaction.type === "Income" ? "+" : "-") +
            " ₹" + transaction.amount.toFixed(2);

        amount.style.color =
            transaction.type === "Income" ? "green" : "red";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.padding = "8px";
        deleteButton.style.width = "auto";
        deleteButton.style.background = "#dc2626";

        deleteButton.addEventListener("click", function() {
            transactions.splice(index, 1);
            saveData();
            updateDashboard();
            showTransactions();
        });

        item.appendChild(details);
        item.appendChild(amount);
        item.appendChild(deleteButton);

        list.appendChild(item);
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;

    if (title === "" || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter valid details!");
        return;
    }

    if (type === "Expense") {
        const income = transactions
            .filter(t => t.type === "Income")
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter(t => t.type === "Expense")
            .reduce((sum, t) => sum + t.amount, 0);

        if (amount > income - expense) {
            alert("Insufficient balance! Add income first.");
            return;
        }
    }

    const transaction = {
        title: title,
        amount: amount,
        type: type,
        category: category,
        date: new Date().toLocaleDateString()
    };

    transactions.push(transaction);

    saveData();
    updateDashboard();
    showTransactions();

    form.reset();

    alert("Transaction added successfully!");
});

// Load saved data when application opens
updateDashboard();
showTransactions();
