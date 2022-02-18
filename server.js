const inquirer = require('inquirer');
const mysql = require('mysql2');
const db = require('./db/connection');
require('console.table');
const db = require('./db/connection');


db.connect(err => {
    if (err) throw err;
    options();
});

const options = () => {
    inquirer.prompt (
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role'
            ]
        })
        .then(answer => {
            switch (answer.choice) {
                case 'View all departments':
                    viewAllDepartments();
                    break;
                case 'View all roles':
                    viewAllRoles();
                    break;
                case 'View all employees':
                    viewAllEmployees();
                    break;
                case 'Add a department':
                    addDepartment();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee role':
                    updateEmployeeRole();
                    break;
            }
        });

    };



function viewAllDepartments() {
// THEN I am presented with a formatted table showing department names and department ids
}

function viewAllRoles() {
//THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
}

function viewAllEmployees() {
    const sql = `SELECT employees.id, employees.first_name, employees.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    LEFT JOIN employees manager on manager.id = employees.manager_id
    INNER JOIN role ON (role.id = employees.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employees.id;`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW ALL EMPLOYEES');
        console.log('\n');
        console.table(res);
        options();
    });
}

function addDepartment() {
//THEN I am prompted to enter the name of the department and that department is added to the database
}

function addRole() {
//THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
}

function addEmployee() {
//THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
}

function updateEmployeeRole() {
//THEN I am prompted to select an employee to update and their new role and this information is updated in the database
}
