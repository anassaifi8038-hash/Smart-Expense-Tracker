
#include <stdio.h>
#include <string.h>

struct Transaction {
    char type[10];
    char category[30];
    float amount;
};

// Save all transactions in file
void saveData(struct Transaction t[], int count) {
    FILE *fp = fopen("transactions.txt", "w");

    if (fp == NULL) {
        printf("File error!\n");
        return;
    }

    for (int i = 0; i < count; i++) {
        fprintf(fp, "%s %s %.2f\n",
                t[i].type, t[i].category, t[i].amount);
    }

    fclose(fp);
}

// Load transactions from file
int loadData(struct Transaction t[]) {
    FILE *fp = fopen("transactions.txt", "r");
    int count = 0;

    if (fp == NULL) {
        return 0;
    }

    while (count < 100 &&
           fscanf(fp, "%9s %29s %f",
                  t[count].type,
                  t[count].category,
                  &t[count].amount) == 3) {
        count++;
    }

    fclose(fp);
    return count;
}

// Calculate income and expense
void calculateBalance(struct Transaction t[], int count,
                      float *income, float *expense) {
    *income = 0;
    *expense = 0;

    for (int i = 0; i < count; i++) {
        if (strcmp(t[i].type, "Income") == 0) {
            *income += t[i].amount;
        } else {
            *expense += t[i].amount;
        }
    }
}

// Save budget
void saveBudget(float budget) {
    FILE *fp = fopen("budget.txt", "w");

    if (fp != NULL) {
        fprintf(fp, "%.2f", budget);
        fclose(fp);
    }
}

// Load budget
float loadBudget() {
    FILE *fp = fopen("budget.txt", "r");
    float budget = 0;

    if (fp != NULL) {
        fscanf(fp, "%f", &budget);
        fclose(fp);
    }

    return budget;
}

// Show transaction history
void showHistory(struct Transaction t[], int count) {
    printf("\n===== TRANSACTION HISTORY =====\n");

    if (count == 0) {
        printf("No transactions found!\n");
        return;
    }

    for (int i = 0; i < count; i++) {
        printf("\n%d. Type: %s\n", i + 1, t[i].type);
        printf("   Category: %s\n", t[i].category);
        printf("   Amount: Rs. %.2f\n", t[i].amount);
    }
}

// Category-wise expense report
void categoryReport(struct Transaction t[], int count) {
    char categories[5][30] = {
        "Food", "Travel", "Shopping", "Education", "Other"
    };

    float total = 0;

    printf("\n===== CATEGORY WISE EXPENSE REPORT =====\n");

    for (int i = 0; i < 5; i++) {
        float categoryTotal = 0;

        for (int j = 0; j < count; j++) {
            if (strcmp(t[j].type, "Expense") == 0 &&
                strcmp(t[j].category, categories[i]) == 0) {
                categoryTotal += t[j].amount;
            }
        }

        printf("%s: Rs. %.2f\n", categories[i], categoryTotal);
        total += categoryTotal;
    }

    printf("-------------------------------\n");
    printf("Total Expense: Rs. %.2f\n", total);
}

// Check budget status
void checkBudget(float budget, float expense) {
    if (budget <= 0) {
        printf("Please set your budget first.\n");
    } else if (expense > budget) {
        printf("Warning! Monthly budget exceeded!\n");
        printf("Exceeded Amount: Rs. %.2f\n", expense - budget);
    } else {
        printf("Remaining Budget: Rs. %.2f\n", budget - expense);
    }
}

int main() {
    int choice, categoryChoice, number;
    int count = 0;

    float income = 0, expense = 0, amount;
    float budget = 0;

    struct Transaction transactions[100];

    // Load saved data
    count = loadData(transactions);
    budget = loadBudget();

    printf("===== SMART EXPENSE TRACKER =====\n");

    while (1) {
        printf("\n1. Add Income\n");
        printf("2. Add Expense\n");
        printf("3. View Transaction History\n");
        printf("4. Check Balance\n");
        printf("5. Edit Transaction\n");
        printf("6. Delete Transaction\n");
        printf("7. Set Monthly Budget\n");
        printf("8. Category Wise Report\n");
        printf("9. Exit\n");

        printf("\nEnter your choice: ");
        scanf("%d", &choice);

        switch (choice) {

            // Add Income
            case 1:
                if (count >= 100) {
                    printf("Transaction limit reached!\n");
                    break;
                }

                printf("Enter income amount: ");
                scanf("%f", &amount);

                if (amount <= 0) {
                    printf("Invalid amount!\n");
                    break;
                }

                strcpy(transactions[count].type, "Income");
                strcpy(transactions[count].category, "Salary");
                transactions[count].amount = amount;

                count++;
                saveData(transactions, count);

                printf("Income added successfully!\n");
                break;

            // Add Expense
            case 2:
                if (count >= 100) {
                    printf("Transaction limit reached!\n");
                    break;
                }

                printf("\n1. Food\n");
                printf("2. Travel\n");
                printf("3. Shopping\n");
                printf("4. Education\n");
                printf("5. Other\n");

                printf("Select category: ");
                scanf("%d", &categoryChoice);

                if (categoryChoice < 1 || categoryChoice > 5) {
                    printf("Invalid category!\n");
                    break;
                }

                printf("Enter expense amount: ");
                scanf("%f", &amount);

                if (amount <= 0) {
                    printf("Invalid amount!\n");
                    break;
                }

                calculateBalance(transactions, count,
                                 &income, &expense);

                if (amount > income - expense) {
                    printf("Insufficient balance!\n");
                    break;
                }

                strcpy(transactions[count].type, "Expense");

                if (categoryChoice == 1)
                    strcpy(transactions[count].category, "Food");
                else if (categoryChoice == 2)
                    strcpy(transactions[count].category, "Travel");
                else if (categoryChoice == 3)
                    strcpy(transactions[count].category, "Shopping");
                else if (categoryChoice == 4)
                    strcpy(transactions[count].category, "Education");
                else
                    strcpy(transactions[count].category, "Other");

                transactions[count].amount = amount;

                count++;
                saveData(transactions, count);

                printf("Expense added successfully!\n");

                calculateBalance(transactions, count,
                                 &income, &expense);
                checkBudget(budget, expense);
                break;

            // View History
            case 3:
                showHistory(transactions, count);
                break;

            // Check Balance
            case 4:
                calculateBalance(transactions, count,
                                 &income, &expense);

                printf("\nTotal Income: Rs. %.2f\n", income);
                printf("Total Expense: Rs. %.2f\n", expense);
                printf("Available Balance: Rs. %.2f\n",
                       income - expense);

                checkBudget(budget, expense);
                break;

            // Edit Transaction
            case 5:
                showHistory(transactions, count);

                if (count == 0)
                    break;

                printf("\nEnter transaction number to edit: ");
                scanf("%d", &number);

                if (number < 1 || number > count) {
                    printf("Invalid transaction number!\n");
                    break;
                }

                printf("Enter new amount: ");
                scanf("%f", &amount);

                if (amount <= 0) {
                    printf("Invalid amount!\n");
                    break;
                }

                calculateBalance(transactions, count,
                                 &income, &expense);

                if (strcmp(transactions[number - 1].type,
                           "Income") == 0) {

                    if (income - transactions[number - 1].amount
                        + amount < expense) {
                        printf("Cannot edit! Insufficient balance.\n");
                        break;
                    }

                } else {
                    if (expense - transactions[number - 1].amount
                        + amount > income) {
                        printf("Cannot edit! Insufficient balance.\n");
                        break;
                    }
                }

                transactions[number - 1].amount = amount;

                saveData(transactions, count);

                printf("Transaction updated successfully!\n");
                break;

            // Delete Transaction
            case 6:
                showHistory(transactions, count);

                if (count == 0)
                    break;

                printf("\nEnter transaction number to delete: ");
                scanf("%d", &number);

                if (number < 1 || number > count) {
                    printf("Invalid transaction number!\n");
                    break;
                }

                for (int i = number - 1; i < count - 1; i++) {
                    transactions[i] = transactions[i + 1];
                }

                count--;

                saveData(transactions, count);

                printf("Transaction deleted successfully!\n");
                break;

            // Set Monthly Budget
            case 7:
                printf("Enter your monthly budget: ");
                scanf("%f", &budget);

                if (budget <= 0) {
                    printf("Invalid budget!\n");
                    budget = 0;
                } else {
                    saveBudget(budget);
                    printf("Budget set successfully!\n");

                    calculateBalance(transactions, count,
                                     &income, &expense);

                    checkBudget(budget, expense);
                }
                break;

            // Category Report
            case 8:
                categoryReport(transactions, count);
                break;

            // Exit
            case 9:
                saveData(transactions, count);
                saveBudget(budget);

                printf("\nData saved successfully!\n");
                printf("Thank you for using Smart Expense Tracker!\n");

                return 0;

            default:
                printf("Invalid choice! Try again.\n");
        }
    }

    return 0;
}
