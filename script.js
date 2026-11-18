
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;

const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const budgetInput = document.getElementById("budgetAmount");
const setBudgetButton = document.getElementById("setBudget");
const budgetStatus = document.getElementById("budgetStatus");
const budgetProgress = document.getElementById("budgetProgress");

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

function formatCurrency(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function getTransactionMonth(transaction) {
    if (transaction.month) {
        return transaction.month;
    }

    if (!transaction.date) {
        return "";
    }

    const parts = transaction.date.split("/");

    if (parts.length === 3) {
        let day = Number(parts[0]);
        let month = Number(parts[1]);
        let year = Number(parts[2]);

        if (day <= 12 && month > 12) {
            [day, month] = [month, day];
        }

        return `${year}-${String(month).padStart(2, "0")}`;
    }

    const date = new Date(transaction.date);

    if (!isNaN(date.getTime())) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    return "";
}

function getCurrentMonthExpenses() {
    const monthKey =
        `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

    return transactions
        .filter(transaction =>
            transaction.type === "Expense" &&
            getTransactionMonth(transaction) === monthKey
        )
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}

function updateBudget() {
    if (budgetInput) {
        budgetInput.value = monthlyBudget || "";
    }

    if (monthlyBudget <= 0) {
        budgetStatus.textContent = "No budget set yet.";
        budgetProgress.style.width = "0%";
        budgetProgress.style.backgroundColor = "#2563eb";
        return;
    }

    const spent = getCurrentMonthExpenses();
    const remaining = monthlyBudget - spent;
    const percentage = (spent / monthlyBudget) * 100;

    budgetProgress.style.width = Math.min(percentage, 100) + "%";
    budgetProgress.style.height = "100%";
    budgetProgress.style.borderRadius = "10px";

    if (percentage >= 100) {
        budgetProgress.style.backgroundColor = "#dc2626";
    } else if (percentage >= 80) {
        budgetProgress.style.backgroundColor = "#f59e0b";
    } else {
        budgetProgress.style.backgroundColor = "#16a34a";
    }

    if (remaining >= 0) {
        budgetStatus.textContent =
            `Monthly Budget: ${formatCurrency(monthlyBudget)} | ` +
            `Spent: ${formatCurrency(spent)} | ` +
            `Remaining: ${formatCurrency(remaining)}`;
    } else {
        budgetStatus.textContent =
            `Budget Exceeded by ${formatCurrency(Math.abs(remaining))}!`;
    }
}

setBudgetButton.addEventListener("click", function() {
    const budget = Number(budgetInput.value);

    if (!Number.isFinite(budget) || budget <= 0) {
        alert("Please enter a valid budget amount!");
        return;
    }

    monthlyBudget = budget;

    localStorage.setItem("monthlyBudget", monthlyBudget);

    updateBudget();

    alert("Monthly Budget Set Successfully!");
});

function updateDashboard() {
    let income = 0;
    let expense = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "Income") {
            income += Number(transaction.amount);
        } else {
            expense += Number(transaction.amount);
        }
    });

    document.getElementById("income").textContent =
        formatCurrency(income);

    document.getElementById("expense").textContent =
        formatCurrency(expense);

    document.getElementById("balance").textContent =
        formatCurrency(income - expense);

    updateBudget();
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
            " " + formatCurrency(Number(transaction.amount));

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
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = transactions
            .filter(t => t.type === "Expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

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
        date: new Date().toLocaleDateString(),
        month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
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
