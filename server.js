const inquirer = require('inquirer');
const mysql = require('mysql2');
const db = require('./db/connection');
require('console.table');
const connection = require('./db/connection');

function viewAllEmployees() {
    const query = `SELECT employees.id, employees.first_name, employees.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    LEFT JOIN employees manager on manager.id = employees.manager_id
    INNER JOIN role ON (role.id = employees.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employees.id;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log('\n');
        console.log('VIEW ALL EMPLOYEES');
        console.log('\n');
        console.table(res);
    });
}
viewAllEmployees();