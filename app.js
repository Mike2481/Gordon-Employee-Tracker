const inquirer = require("inquirer");
const db = require("./db/connection");
require("console.table");
// connect database and start the application
db.connect((err) => {
  if (err) throw err;
  options();
});

//  First prompt allows the user to select what they want to do
// WHEN I start the application THEN I am presented with the following options:
// view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
const options = () => {
  inquirer
    .prompt({
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit"
      ],
    })
    // uses the answer to determine which function to run using a switch/case
    .then((answer) => {
      switch (answer.choice) {
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Exit":
          db.end();
          break;
      }
    });
};
// WHEN I choose to view all departments
const viewAllDepartments = () => {
  // THEN I am presented with a formatted table showing department names and department ids
  const sql = `SELECT name AS 'department names', id AS 'department ids' 
  FROM department`;

  db.query(sql, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.log("VIEW ALL DEPARTMENTS");
    console.log("\n");
    // produces a table in the terminal
    console.table(res);
    // starts the initial prompt over
    options();
  });
};
// WHEN I choose to view all roles
const viewAllRoles = () => {
  //THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
  const sql = `SELECT 
  r.title AS 'job title',
  r.id AS 'role id',
  d.name AS department,
  r.salary
  FROM role r 
  JOIN department d
      ON r.department_id = d.id`;

  db.query(sql, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.log("VIEW ALL ROLES");
    console.log("\n");
    // produces a table in the terminal
    console.table(res);
    // starts the initial prompt over
    options();
  });
};

// WHEN I choose to view all employees
const viewAllEmployees = () => {
  // THEN I am presented with a formatted table showing employee data, including employee ids, first names,
  // last names, job titles, departments, salaries, and managers that the employees report to
  const sql = `SELECT 
  e.id,
  e.first_name AS 'first name',
  e.last_name AS 'last name',
  r.title AS 'job title',
  d.name AS 'department',
  r.salary,
  concat(m.first_name, ' ', m.last_name) AS 'reports to'
  FROM employees e
  LEFT JOIN employees m
      ON e.manager_id = m.role_id
  JOIN role r
      ON r.id = e.role_id
  JOIN department d
      ON d.id = r.department_id
  ORDER BY e.id
  `;
  db.query(sql, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.log("VIEW ALL EMPLOYEES");
    console.log("\n");
    // produces a table in the terminal
    console.table(res);
    // starts the initial prompt over
    options();
  });
};

// WHEN I choose to add a department
const addDepartment = () => {
  //THEN I am prompted to enter the name of the department and that department is added to the database
  inquirer
    .prompt({
      // allows the user to make a new department
      type: "input",
      name: "name",
      message: "What is the department name?",
    })
    .then((answer) => {
      // pass that name into the INSERT INTO for the department table
      const sql = `INSERT INTO department (name) VALUES (?)`;
      const params = [answer.name];
      db.query(sql, params, (err, result) => {
        if (err) throw err;
        // produces a table in the terminal
        console.table(result);
        // starts the initial prompt over
        options();
      });
    });
};

// WHEN I choose to add a role
const addRole = async () => {
  //THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
  db.query(`SELECT * FROM department`, (err, res) => {
    if (err) throw err;
    // map over the results and pull the id and name, then assign to the choices variable to use as a choice for department list
    let choices = res.map((res) => `${res.id} ${res.name}`);
    console.log(choices);
    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          choices: choices,
          message: "Which department is this for?",
        },
        {
          type: "input",
          name: "name",
          message: "What is the role name?", // Requires a role name to be created
          validate: (roleInput) => {
            if (roleInput) {
              return true;
            } else {
              console.log("please enter a name for the role");
            }
          },
        },
        {
          type: "input",
          name: "salary",
          message: "What is the role salary?", // Requires a role salary to be set
          validate: (answer) => {
            return isNaN(answer)
              ? console.log("please enter a numerical value for salary")
              : answer == ""
              ? console.log("please enter a salary")
              : true;
          },
        },
      ])
      .then((answers) => {
        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`;
        const params = [
          answers.name,
          answers.salary,
          answers.department.split(" ")[0], // selects the numerical value as the id
        ];
        db.query(sql, params, (err, result) => {
          if (err) throw err;
          // produces a table in the terminal
          console.table(res);
          // starts the initial prompt over
          options();
        });
      });
  });
};

// Get new employee name for addEmployee
const newEmployeeName = () => {
  return [
    {
      type: "input",
      name: "first",
      message: "What is the employee's first name?",
    },
    {
      type: "input",
      name: "last",
      message: "What is the employee's last name?",
    },
  ];
};

// WHEN I choose to add an employee
const addEmployee = async () => {
  //THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
  const employeeName = await inquirer.prompt(newEmployeeName()); // Gets the first and last name
  // Gets the employee role_id
  db.query(
    "SELECT role.id, role.title FROM role ORDER BY role.id;",
    async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
        {
          name: "role",
          type: "list",
          choices: () => res.map((res) => res.title),
          message: "What is the new employee role?: ",
        },
      ]);
      let roleId;
      for (const row of res) {
        if (row.title === role) {
          roleId = row.id;
          continue;
        }
      }
      // Gets the manager_id
      db.query("SELECT * FROM employees;", async (err, res) => {
        if (err) throw err;
        // pulls the employee's first and last names to provide as choices
        let choices = res.map((res) => `${res.first_name} ${res.last_name}`);
        // adds in a 'nobody' value in case the employee will be a manager
        choices.push("nobody");
        let { manager } = await inquirer.prompt([
          {
            name: "manager",
            type: "list",
            choices: choices,
            message: "Who will be the employee's new manager?",
          },
        ]);
        let managerId;
        if (manager === "nobody") {
          managerId = null;
        } else {
          for (const data of res) {
            data.fullName = `${data.first_name} ${data.last_name}`;
            if (data.fullName === manager) {
              managerId = data.id;
              continue;
            }
          }
        }
        db.query(
          `INSERT INTO employees SET ?`, // Allows previous results to be passed into the row by key: value
          {
            first_name: employeeName.first,
            last_name: employeeName.last,
            role_id: roleId,
            manager_id: managerId,
          },
          (err, res) => {
            if (err) throw err;
            // Starts the main prompt over
            options();
          }
        );
      });
    }
  );
};

// Gets the employee id to use in the update function
function getId() {
  return [
    {
      name: "name",
      type: "input",
      message: "What is the employee id?:  ",
    },
  ];
}

// WHEN I choose to update an employee role
async function updateEmployeeRole() {
  //THEN I am prompted to select an employee to update and their new role and this information is updated in the database
  const employeesId = await inquirer.prompt(getId());

  db.query(
    "SELECT role.id, role.title FROM role ORDER BY role.id;",
    async (err, res) => {
      if (err) throw err;
      const { role } = await inquirer.prompt([
        // chosen role
        {
          name: "role",
          type: "list",
          choices: () => res.map((res) => res.title),
          message: "What is the employee's new role?: ",
        },
      ]);
      let roleId;
      for (const row of res) {
        if (row.title === role) {
          roleId = row.id;
          continue;
        }
      }
      db.query(
        `UPDATE employees
        SET role_id = ${roleId}
        WHERE employees.id = ${employeesId.name}`,
        async (err, res) => {
          if (err) throw err;
            // Starts the main prompt over
            options();
        }
      );
    }
  );
}
// ================================================================
//    Tried to get the manager_id to update along with the role
//   This was part of the Bonus but wasn't part of the
//   Acceptance Criteria
// ================================================================

//       // Gets the manager_id
//   db.query(
//     "SELECT * FROM employees;",
//     async (err, res) => {
//         if (err) throw err;
//         // pulls the employee's first and last names to provide as choices
//         let choices = res.map((res) => `${res.first_name} ${res.last_name}`);
//         // adds in a 'nobody' value in case the employee will be a manager
//         choices.push("nobody");
//         let { manager } = await inquirer.prompt([
//           {
//             name: "manager",
//             type: "list",
//             choices: choices,
//             message: "Who will be the employee's new manager?",
//           },
//         ]);
//         let managerId;
//         if (manager === "nobody") {
//           managerId = null;
//         } else {
//           for (const data of res) {
//             data.fullName = `${data.first_name} ${data.last_name}`;
//             if (data.fullName === manager) {
//               managerId = data.id;
//               continue;
//             }
//           }
//         }
//       });
