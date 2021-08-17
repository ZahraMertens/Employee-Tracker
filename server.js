const express = require('express');
const fs = require('fs');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const { inherits } = require('util');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// const db = mysql.createConnection(
//   {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'employees_db'
//   },
//   console.log(`Connected to the employees_db database.`)
// );

function startPrompts(){
    console.log("\x1b[32m", "\n========================== Welcome to the Employee's Database! ==========================\n")
        inquirer.prompt([
            {
                type: "list",
                message: "What would you like to do?",
                name: "viewOptions",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role"
                ]
            }
        ])
        .then(function(data){
            console.log("\x1b[33m", `\n------  Awesome! ------\n`);
            const selectedOpt = data.viewOptions;
            switch(selectedOpt){
                case "View all departments":
                    if (addMembers === "YES, add Engineer!"){
                        return renderEngineer();
                }
                case "View all roles":
                    if (addMembers === "YES, add Intern!"){
                        return renderIntern();
                }
                case "View all employees":
                    if (addMembers === "NO, the Team is complete!"){
                        return writeToFile("./docs/index.html", renderHtml(teamHeader, teamMembers));
                }
                case "Add a department":
                    if (addMembers === "NO, the Team is complete!"){
                        return writeToFile("./docs/index.html", renderHtml(teamHeader, teamMembers));
                }
                case "Add a role":
                    if (addMembers === "NO, the Team is complete!"){
                        return writeToFile("./docs/index.html", renderHtml(teamHeader, teamMembers));
                }
                case "Add an employee":
                    if (addMembers === "NO, the Team is complete!"){
                        return writeToFile("./docs/index.html", renderHtml(teamHeader, teamMembers));
                }
                case "Update an employee role":
                    if (addMembers === "NO, the Team is complete!"){
                        return writeToFile("./docs/index.html", renderHtml(teamHeader, teamMembers));
                }
            }
        })
}

const viewDepartment = function () {

}

const vieweRoles = function () {}

const viewEmployees = function () {}

const addDepartment = function () {}

const addRole = function () {}

const addEmployee = function () {}

const updateRole = function () {}

startPrompts();
